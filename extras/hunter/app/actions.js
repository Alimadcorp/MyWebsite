"use server"

export async function searchEmails(domain, searchId) {
  try {
    const url = "https://api.prospeo.io/domain-search"
    const apiKey = process.env.PROSPEO_API_KEY || "your_api_key"

    const requestBody = {
      company: domain,
      limit: 25,
    }

    // Add search_id for pagination
    if (searchId) {
      requestBody.search_id = searchId
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-KEY": apiKey,
      },
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      return {
        success: false,
        error: "API returned an error",
      }
    }

    return {
      success: true,
      data: data.response,
    }
  } catch (error) {
    console.error("Search emails error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
