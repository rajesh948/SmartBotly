import axios from "axios";

/**
 * WhatsApp Service
 * Helper functions to send messages via WhatsApp Cloud API
 */

/**
 * Send text message
 */
export async function sendTextMessage(
  phoneNumberId: string,
  to: string,
  message: string
): Promise<boolean> {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Text message sent:", response.data.messages[0].id);
    return true;
  } catch (error: any) {
    console.error("❌ Failed to send text message:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Send image message
 */
export async function sendImageMessage(
  phoneNumberId: string,
  to: string,
  imageUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          link: imageUrl,
          caption: caption || "",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Image message sent:", response.data.messages[0].id);
    return true;
  } catch (error: any) {
    console.error("❌ Failed to send image message:", error.response?.data || error.message);
    return false;
  }
}

/**
 * Send template message (for notifications)
 */
export async function sendTemplateMessage(
  phoneNumberId: string,
  to: string,
  templateName: string,
  language: string = "en"
): Promise<boolean> {
  try {
    const token = process.env.WHATSAPP_TOKEN;
    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`;

    const response = await axios.post(
      url,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: {
            code: language,
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("✅ Template message sent:", response.data.messages[0].id);
    return true;
  } catch (error: any) {
    console.error("❌ Failed to send template message:", error.response?.data || error.message);
    return false;
  }
}
