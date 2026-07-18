import { useState } from "react";
import axios from "../lib/axios";
import { MessageCircle, X, Send } from "lucide-react";

const ChatBot = () => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hi 👋 I'm Leopard AI. Ask me to recommend or compare products.",
        },
    ]);

    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {

        if (!message.trim()) return;

        const userMessage = message;

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: userMessage,
            },
        ]);

        setMessage("");

        try {

            setLoading(true);

            const res = await axios.post("/ai/chat", {
                message: userMessage,
            });

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: res.data.reply,
                },
            ]);

        } catch (error) {

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: "Something went wrong.",
                },
            ]);

        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-[100] bg-emerald-600 p-4 rounded-full shadow-xl hover:bg-emerald-500"
                >
                    <MessageCircle />
                </button>
            )}

            {open && (
                <div className="fixed bottom-6 right-6 w-96 h-[550px] bg-gray-900 border border-emerald-600 rounded-xl shadow-2xl flex flex-col z-[100]">

                    <div className="flex justify-between items-center p-4 border-b border-gray-700">

                        <div className="flex items-center space-x-2">
                            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                            <h2 className="font-bold text-lg">
                                Leopard AI
                            </h2>
                        </div>

                        <button onClick={() => setOpen(false)}>
                            <X />
                        </button>

                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">

                        {messages.map((msg, index) => (

                            <div
                                key={index}
                                className={`max-w-[80%] px-4 py-2 rounded-xl whitespace-pre-wrap ${
                                    msg.sender === "user"
                                        ? "bg-emerald-600 ml-auto"
                                        : "bg-gray-700"
                                }`}
                            >
                                {msg.text}
                            </div>

                        ))}

                        {loading && (
                            <div className="bg-gray-700 px-4 py-2 rounded-xl w-fit">
                                Thinking...
                            </div>
                        )}

                    </div>

                    <div className="border-t border-gray-700 p-3 flex gap-2">

                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                            }}
                            className="flex-1 bg-gray-800 rounded-lg px-3 py-2 outline-none"
                            placeholder="Ask something..."
                        />

                        <button
                            onClick={sendMessage}
                            className="bg-emerald-600 p-2 rounded-lg"
                        >
                            <Send size={18} />
                        </button>

                    </div>

                </div>
            )}
        </>
    );
};

export default ChatBot;