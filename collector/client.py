"""
HTTP Client for the Unstop Public Leaderboard API.
Features bounded retries with exponential backoff for transient failures (429, 5xx, timeouts).
"""

import logging
import time
from typing import Any, Dict, Optional
import requests

logger = logging.getLogger(__name__)


class UnstopAPIError(Exception):
    """Base exception for Unstop API communication errors."""
    pass


class UnstopRateLimitError(UnstopAPIError):
    """Raised when rate limit is encountered and retries are exhausted."""
    pass


class UnstopClient:
    """
    Client for interacting with the public Unstop leaderboard API.
    """

    DEFAULT_HEADERS = {
        "User-Agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        ),
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Referer": "https://unstop.com/",
        "Origin": "https://unstop.com",
    }

    def __init__(
        self,
        base_url: str = "https://unstop.com/api/public/live-leaderboard/290344/CodeContest",
        max_retries: int = 3,
        backoff_factor: float = 1.5,
        timeout: int = 15,
        session: Optional[requests.Session] = None,
    ):
        self.base_url = base_url
        self.max_retries = max_retries
        self.backoff_factor = backoff_factor
        self.timeout = timeout
        self.session = session or requests.Session()

    def fetch_page(
        self,
        page: int,
        per_page: int = 30,
        filter_name: str = "timestamp",
        filter_value: int = 0,
        extra_params: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        """
        Fetch a single leaderboard page with bounded retries and exponential backoff.

        :param page: The page number to fetch (1-indexed).
        :param per_page: The number of items per page.
        :param filter_name: Filter name parameter (defaults to "timestamp").
        :param filter_value: Filter value parameter (defaults to 0).
        :param extra_params: Additional query parameters.
        :return: JSON parsed response as a dictionary.
        :raises UnstopAPIError: If the request fails after all retries.
        """
        params: Dict[str, Any] = {
            "page": page,
            "per_page": per_page,
            "filterName": filter_name,
            "filterValue": filter_value,
            "undefined": "true",
        }
        if extra_params:
            params.update(extra_params)

        attempt = 0
        last_exception: Optional[Exception] = None

        while attempt <= self.max_retries:
            attempt += 1
            start_time = time.perf_counter()

            try:
                logger.debug("Requesting page %d (Attempt %d/%d) from %s", page, attempt, self.max_retries + 1, self.base_url)
                response = self.session.get(
                    self.base_url,
                    params=params,
                    headers=self.DEFAULT_HEADERS,
                    timeout=self.timeout,
                )
                elapsed = time.perf_counter() - start_time

                # Check for rate limiting (429)
                if response.status_code == 429:
                    retry_after = response.headers.get("Retry-After")
                    sleep_time = float(retry_after) if retry_after else (self.backoff_factor ** attempt) + 1.0
                    logger.warning(
                        "Rate limit (HTTP 429) encountered on page %d (attempt %d/%d). Sleeping %.2fs.",
                        page, attempt, self.max_retries + 1, sleep_time
                    )
                    if attempt > self.max_retries:
                        raise UnstopRateLimitError(
                            f"HTTP 429 Too Many Requests for page {page} after {attempt} attempts."
                        )
                    time.sleep(sleep_time)
                    continue

                # Check for server errors (5xx)
                if 500 <= response.status_code < 600:
                    sleep_time = self.backoff_factor ** attempt
                    logger.warning(
                        "Server error (HTTP %d) on page %d (attempt %d/%d). Elapsed: %.2fs. Retrying in %.2fs.",
                        response.status_code, page, attempt, self.max_retries + 1, elapsed, sleep_time
                    )
                    if attempt > self.max_retries:
                        response.raise_for_status()
                    time.sleep(sleep_time)
                    continue

                # Raise for other 4xx client errors
                response.raise_for_status()

                # Parse JSON
                try:
                    data = response.json()
                except ValueError as json_err:
                    logger.error("Failed to parse JSON response for page %d: %s", page, json_err)
                    raise UnstopAPIError(f"Malformed JSON response on page {page}: {json_err}") from json_err

                logger.info(
                    "Fetched page %d successfully: HTTP %d in %.2fs",
                    page, response.status_code, elapsed
                )
                return data

            except (requests.Timeout, requests.ConnectionError) as req_err:
                elapsed = time.perf_counter() - start_time
                last_exception = req_err
                sleep_time = self.backoff_factor ** attempt
                logger.warning(
                    "Network error (%s) on page %d (attempt %d/%d) after %.2fs. Retrying in %.2fs.",
                    type(req_err).__name__, page, attempt, self.max_retries + 1, elapsed, sleep_time
                )
                if attempt > self.max_retries:
                    raise UnstopAPIError(
                        f"Network error fetching page {page} after {attempt} attempts: {req_err}"
                    ) from req_err
                time.sleep(sleep_time)

            except requests.HTTPError as http_err:
                last_exception = http_err
                # Non-5xx/429 HTTP errors
                logger.error("HTTP error fetching page %d: %s", page, http_err)
                raise UnstopAPIError(f"HTTP error on page {page}: {http_err}") from http_err

        raise UnstopAPIError(
            f"Failed to fetch page {page} after {self.max_retries + 1} attempts: {last_exception}"
        )
