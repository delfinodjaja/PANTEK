export const getFriendlyErrorMessage = (error: any): string => {
  let message = '';
  let code: number | string | undefined;

  // Handle various error formats
  if (typeof error === 'string') {
    try {
      const parsed = JSON.parse(error);
      if (parsed.error) {
        code = parsed.error.code;
        message = parsed.error.message;
      }
    } catch {
      message = error;
    }
  } else if (error?.error?.code || error?.status || error?.code) {
    code = error.error?.code || error.status || error.code;
    message = error.error?.message || error.message;
  } else if (error instanceof Error) {
    message = error.message;
  }

  // Map codes to friendly messages
  switch (code) {
    case 429:
    case 'RATE_LIMIT':
      return "API quota exceeded. Please wait a moment and try again, or check your API key limits at aistudio.google.com";
    case 401:
    case 'INVALID_API_KEY':
      return "Invalid API key. Please check your key in Settings.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Internal server error. The AI engine is currently unavailable. Please try again later.";
    default:
      if (message.toLowerCase().includes('fetch') || message.toLowerCase().includes('network')) {
        return "Connection failed. Please check your internet and try again.";
      }
      return message || "Something went wrong. Please try again.";
  }
};
