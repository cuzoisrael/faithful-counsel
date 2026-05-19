import { MessageCircle } from "lucide-react";

const PHONE = "447448519299"; // E.164 without "+"
export const WHATSAPP_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(
  "Hello IACPD, I'd like to learn more about your counseling services.",
)}`;

const WhatsAppButton = () => (
  <a
    href={WHATSAPP_URL}
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chat with us on WhatsApp"
    className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-[#25D366] text-white rounded-full shadow-lg px-4 py-3 hover:scale-105 transition-transform"
  >
    <MessageCircle size={20} />
    <span className="hidden sm:inline text-sm font-semibold">Chat on WhatsApp</span>
  </a>
);

export default WhatsAppButton;
