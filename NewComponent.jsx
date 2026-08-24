import React, { useEffect, useState, useRef } from "react";
import {
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  CircularProgress,
  Alert,
  Card,
  IconButton,
} from "@mui/material";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

function NewComponent(props) {
  const [query, setQuery] = useState("");
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [isFullScreen, setIsFullScreen] = useState(
    props?.UIOptions?.format === "fullscreen"
  );

  const isTypingLocally = useRef(false);

  useEffect(() => {
    if (props?.UIOptions?.format) {
      setIsFullScreen(props.UIOptions.format === "fullscreen");
    }
  }, [props?.UIOptions?.format]);

  const handleSwitchFullScreen = (fullScreen) => {
    setIsFullScreen(fullScreen);
    props?.messageHandlers?.switchFullScreen?.(fullScreen);
  };

  const API_URL =
    process.env.NODE_ENV === "production"
      ? props.deployedBackendURL || ""
      : import.meta.env.VITE_API_URL || "";

  const isValidHolidayQuery = (str) => {
    if (!str) return false;
    const cleanStr = str.trim();
    return !/^[0-9\s\+\-\*\/\%\(\)\.]+$/.test(cleanStr);
  };

  const executeSearch = async (searchQuery) => {
    const trimmedQuery = searchQuery?.trim();
    if (!trimmedQuery) return;

    if (!isValidHolidayQuery(trimmedQuery)) {
      setAnswer(
        "Please enter a valid holiday search (e.g., 'Bank holidays in USA 2026')."
      );
      setHolidays([]);
      setErrorMsg("");
      return;
    }

    setLoading(true);
    setAnswer("");
    setErrorMsg("");
    setHolidays([]);

    try {
      const response = await fetch(
        `${API_URL}/search?query=${encodeURIComponent(trimmedQuery)}`
      );

      if (!response.ok) {
        throw new Error(`Server returned HTTP status ${response.status}`);
      }

      const data = await response.json();

      if (data.answer) {
        setAnswer(data.answer);
      } else if (Array.isArray(data)) {
        if (data.length === 0) {
          setAnswer("No holidays found for this query.");
        } else {
          setHolidays(data);
        }
      } else if (data.error) {
        setErrorMsg(data.error);
      } else {
        setErrorMsg("No results found.");
      }
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setErrorMsg("Error fetching holiday data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    props?.messageHandlers?.componentLoaded?.();

    const rawInitialQuery =
      props?.searchData?.query ||
      props?.searchData?._processedQuery ||
      props?.searchData?.queryTerm ||
      props?.searchData?.rawQuery ||
      "";

    if (!isTypingLocally.current && rawInitialQuery !== query) {
      if (rawInitialQuery && isValidHolidayQuery(rawInitialQuery)) {
        setQuery(rawInitialQuery);
        executeSearch(rawInitialQuery);
      } else if (!rawInitialQuery) {
        setQuery("");
      }
    }
  }, [
    props?.searchData?.query,
    props?.searchData?._processedQuery,
    props?.searchData?.queryTerm,
    props?.searchData?.rawQuery,
  ]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    isTypingLocally.current = true;
    setQuery(val);

    if (props?.messageHandlers?.onQueryChange) {
      props.messageHandlers.onQueryChange(val);
    } else if (props?.messageHandlers?.onSearchQueryChange) {
      props.messageHandlers.onSearchQueryChange(val);
    } else if (props?.messageHandlers?.updateSearchQuery) {
      props.messageHandlers.updateSearchQuery(val);
    }

    setTimeout(() => {
      isTypingLocally.current = false;
    }, 300);
  };

  return (
    <Card
      sx={{
        position: "relative",
        maxWidth: isFullScreen ? "100%" : "400px",
        padding: isFullScreen ? "20px" : "16px",
        width: "100%",
      }}
    >
      <IconButton
        onClick={() => handleSwitchFullScreen(!isFullScreen)}
        sx={{
          position: "absolute",
          top: 8,
          right: 8,
        }}
      >
        {isFullScreen ? <CancelOutlinedIcon /> : <OpenInNewIcon />}
      </IconButton>

      <Box>
        <Typography variant="h6" gutterBottom>
          Holiday Calendar
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            mt: 1,
          }}
        >
          <TextField
            fullWidth
            size="small"
            label="Ask about holidays"
            placeholder="e.g. Bank holidays in USA 2026"
            value={query}
            onChange={handleInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                executeSearch(query);
                props?.messageHandlers?.onSearchSubmit?.(query);
              }
            }}
          />

          <Button
            variant="contained"
            onClick={() => {
              executeSearch(query);
              props?.messageHandlers?.onSearchSubmit?.(query);
            }}
            disabled={loading}
            sx={{
              minWidth: "100px",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Search"
            )}
          </Button>
        </Box>

        {answer && (
          <Typography
            variant="body1"
            sx={{
              mt: 2,
              fontWeight: "bold",
            }}
          >
            {answer}
          </Typography>
        )}

        {errorMsg && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {errorMsg}
          </Alert>
        )}

        {holidays.length > 0 && (
          <List sx={{ mt: 2 }}>
            {holidays.map((holiday, idx) => (
              <ListItem key={idx} divider>
                <Typography variant="body2">
                  <strong>{holiday.date}</strong>
                  {" — "}
                  {holiday.name}

                  {holiday.holidayTypes?.length > 0 && (
                    <>
                      {" "}
                      <span>
                        ({holiday.holidayTypes.join(", ")})
                      </span>
                    </>
                  )}
                </Typography>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
}

export default NewComponent;
