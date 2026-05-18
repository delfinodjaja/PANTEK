exports.handler = async (event, context) => {
  try {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "ok",
        time: new Date().toISOString(),
        service: "Digital Twin Analytics Intelligence"
      })
    };
  } catch (error) {
    console.error("[Netlify Health Error]", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message || "Internal Server Error" })
    };
  }
};
