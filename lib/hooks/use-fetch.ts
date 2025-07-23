import { useEffect, useState } from "react";

function useFetch(url, method = "GET", body = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Create an abort controller to handle cleanup when the component unmounts
    const abortController = new AbortController();

    // Fetch options based on the specified method and body
    const fetchOptions = {
      method: method,
      headers: {
        "Content-Type": "application/json", // Adjust content type as needed
      },
      signal: abortController.signal,
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    // Fetch data from the specified URL
    fetch(url, fetchOptions)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        setData(responseData);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        if (err.name === "AbortError") {
          // Request was aborted (component unmounted), no need to update state
          return;
        }
        setError(err);
        setLoading(false);
        setData(null);
      });

    // Cleanup function to abort the fetch request if the component unmounts
    return () => {
      abortController.abort();
    };
  }, [url, method, body]);

  return { data, loading, error };
}

export default useFetch;
