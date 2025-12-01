// API Testing Script
// Run this in your browser console or as a separate test file

const testForgotPasswordAPI = async (email = "test@example.com") => {
    const API_URL = "http://localhost:8080/api";
    
    console.log("🧪 Testing Forgot Password API");
    console.log("📍 URL:", `${API_URL}/auth/forgot-password`);
    console.log("📧 Email:", email);
    
    try {
        const response = await fetch(`${API_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        console.log("📊 Response Status:", response.status);
        console.log("📊 Response Headers:", [...response.headers.entries()]);
        
        // Try to get response body regardless of status
        const responseText = await response.text();
        console.log("📄 Raw Response Body:", responseText);
        
        // Try to parse as JSON if possible
        try {
            const responseData = JSON.parse(responseText);
            console.log("📋 Parsed Response Data:", responseData);
            
            if (responseData.error) {
                console.error("❌ Server Error Details:", responseData.error);
            }
            if (responseData.message) {
                console.log("💬 Server Message:", responseData.message);
            }
            if (responseData.stack) {
                console.error("🔧 Server Stack Trace:", responseData.stack);
            }
            
        } catch (parseError) {
            console.log("⚠️ Response is not JSON, raw content:", responseText);
        }
        
    } catch (error) {
        console.error("🚨 Network Error:", error);
    }
};

// Test with the email from your screenshot
testForgotPasswordAPI("maulanabagasfadhila@gmail.com");

// Also test with a simple email
testForgotPasswordAPI("test@example.com");