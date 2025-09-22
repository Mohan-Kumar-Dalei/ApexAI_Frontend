import React, { useState, useEffect, useRef } from "react";
import { Send, Plus } from "lucide-react";
import axios from "../../utils/axios";
import { io } from "socket.io-client";
import { NavLink } from "react-router-dom";

// Avatar component for User / AI
const Avatar = ({ text, isAI }) => (
    <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-white ${isAI ? "bg-lime-600" : "bg-slate-600"
            }`}
    >
        {isAI ? "A" : text || "U"}
    </div>
);

// Shimmer bubble for AI thinking
const ShimmerBubble = () => (
    <div className="flex items-start gap-3">
        <Avatar isAI />
        <div className="max-w-xl rounded-lg rounded-tl-none border border-slate-700 bg-slate-800 font-semibold px-4 py-2">
            <span className="shimmer">Thinking...</span>
        </div>
    </div>
);

const ChatPanel = () => {
    const [chats, setChats] = useState([]);
    const [activeChat, setActiveChat] = useState(null);
    const [messagesMap, setMessagesMap] = useState({});
    const [input, setInput] = useState("");
    const [currentUser, setCurrentUser] = useState(null);
    const [authError, setAuthError] = useState(false);
    const [loadingAuth, setLoadingAuth] = useState(true);
    const [loadingAI, setLoadingAI] = useState(false);
    const [socketIO, setSocketIO] = useState(null);
    const messagesEndRef = useRef(null);

    // Fetch chats from DB
    const fetchChats = async () => {
        try {
            const chatRes = await axios.get("/api/chat", { withCredentials: true });
            setChats(chatRes.data.chats || []);
        } catch (err) {
            console.error("Error fetching chats", err);
        }
    };

    // Load user + initial chats
    useEffect(() => {
        const loadData = async () => {
            setLoadingAuth(true)
            try {
                const userRes = await axios.get("/auth/user", { withCredentials: true });
                // store the full user object when available; fallback to string
                setCurrentUser(userRes.data.user ? userRes.data.user.fullName : null);
                setAuthError(false)
                await fetchChats();
            } catch (err) {
                console.error("Error loading data", err);
                // if auth fails, show error screen
                setAuthError(true)
            } finally {
                setLoadingAuth(false)
            }
        };
        loadData();
    }, []);

    // Socket setup
    useEffect(() => {
        const socketInstance = io("https://apexai-backend.onrender.com", { withCredentials: true });
        setSocketIO(socketInstance);

        socketInstance.on("ai-response", (apex) => {
            const aiMessage = {
                _id: Date.now().toString(),
                sender: "ai",
                text: apex.content,
                chatId: apex.chat,
                timestamp: new Date().toISOString()
            };
            setMessagesMap((prev) => ({
                ...prev,
                [apex.chat]: [...(prev[apex.chat] || []), aiMessage],
            }));
            setLoadingAI(false);
        });

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    // Scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messagesMap, activeChat, loadingAI]);

    // Get user initials
    const getInitials = () => {
        if (!currentUser) return "";
        if (typeof currentUser === "string") {
            const parts = currentUser.split(" ");
            return parts.map((p) => p[0]).join("").toUpperCase();
        }
        const first = currentUser.firstName || "";
        const last = currentUser.lastName || "";
        return (first.charAt(0) + last.charAt(0)).toUpperCase();
    };

    // Safely format timestamps (returns empty string when invalid)
    const formatTime = (ts) => {
        if (!ts) return "";
        try {
            const d = new Date(ts);
            if (isNaN(d.getTime())) return "";
            return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } catch {
            return "";
        }
    };

    // Create new chat
    const createChat = async () => {
        try {
            const res = await axios.post(
                "/api/chat",
                { title: "New Chat" },
                { withCredentials: true }
            );
            const newChat = res.data.chat;
            setActiveChat(newChat._id);
            setMessagesMap((prev) => ({ ...prev, [newChat._id]: [] }));
            await fetchChats(); // refresh sidebar
        } catch (err) {
            console.error("Error creating chat", err);
        }
    };

    // Open existing chat
    const openChat = async (chat) => {
        setActiveChat(chat._id);
        if (!messagesMap[chat._id]) {
            try {
                const res = await axios.get(`/api/chat/${chat._id}/messages`, { withCredentials: true });
                const serverMsgs = res.data.messages || [];
                // map server message shape to client shape { _id, sender, text, chatId }
                const mapped = serverMsgs.map((m) => ({
                    _id: m._id,
                    sender: m.role === 'model' ? 'ai' : 'user',
                    text: m.content || m.text || '',
                    chatId: m.chat || chat._id,
                    // prefer createdAt, then timestamp, then updatedAt; fallback to now
                    timestamp: m.createdAt || m.timestamp || m.updatedAt || new Date().toISOString(),
                }));
                setMessagesMap((prev) => ({ ...prev, [chat._id]: mapped }));
            } catch (err) {
                console.error("Error loading messages", err);
                setMessagesMap((prev) => ({ ...prev, [chat._id]: [] }));
            }
        }
    };

    // Send message
    const sendMessage = () => {
        if (!input || !activeChat) return;
        const userMsg = {
            _id: Date.now().toString(),
            sender: "user",
            text: input,
            chatId: activeChat,
            timestamp: new Date().toISOString()
        };

        setMessagesMap((prev) => ({
            ...prev,
            [activeChat]: [...(prev[activeChat] || []), userMsg],
        }));

        socketIO.emit("ai-message", { content: input, chat: activeChat });

        setInput("");
        setLoadingAI(true);
    };

    const messages = messagesMap[activeChat] || [];

    // Show loading while checking auth
    if (loadingAuth) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-900 text-slate-300">
                <div className="text-lg text-slate-400">Loading...</div>
            </div>
        )
    }

    // If auth error, show a centered not-found / error screen
    if (authError || !currentUser) {
        return (
            <div className="flex flex-col h-screen w-screen items-center justify-center bg-slate-900 text-slate-300">
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-8 text-center">
                    <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                    <p className="text-slate-400">You are not authenticated. Please login to access the chat panel.</p>
                </div>
                <NavLink to="/auth/login" className="mt-4 text-sm text-slate-700 font-semibold px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600">
                    Login
                </NavLink>
            </div>

        )
    }

    return (
        <div className="flex h-screen w-screen flex-col bg-slate-900 text-slate-300">
            {/* Navbar */}
            <header className="flex items-center justify-between border-b border-slate-700 bg-slate-800/50 p-4">
                <h1 className="text-xl font-bold text-white">Apex AI</h1>
                <Avatar text={getInitials()} />
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="hidden w-72 flex-col border-r border-slate-700 bg-slate-900 p-4 sm:flex">
                    <button
                        onClick={createChat}
                        className="mb-4 flex items-center justify-center gap-2 rounded-lg bg-green-500 px-4 py-2 font-semibold text-slate-900 hover:bg-green-600"
                    >
                        <Plus size={18} /> New Chat
                    </button>

                    <div className="flex flex-col gap-2 overflow-y-auto">
                        {chats.map((chat) => (
                            <div
                                key={chat._id}
                                onClick={() => openChat(chat)}
                                className={`cursor-pointer rounded-lg p-2 font-medium ${activeChat === chat._id
                                    ? "bg-green-600 text-slate-900"
                                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                                    }`}
                            >
                                {chat.title || "Untitled Chat"}
                            </div>
                        ))}
                    </div>
                </aside>

                {/* Chat Area */}
                <main className="flex flex-1 flex-col">
                    {activeChat && messages.length > 0 ? (
                        <div className="flex-1 space-y-6 overflow-y-auto p-6">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`flex items-start gap-3 ${msg.sender === "user" ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    {msg.sender === "ai" && <Avatar isAI />}
                                    <div
                                        className={`max-w-xl p-4 ${msg.sender === "user"
                                            ? "rounded-lg rounded-tr-none bg-lime-700 font-medium text-slate-200"
                                            : "rounded-lg rounded-tl-none border border-slate-700 bg-slate-800 text-slate-200"
                                            }`}
                                    >
                                        {msg.text}
                                        <div className="text-xs text-slate-300 font-semibold mt-2">{formatTime(msg.timestamp)}</div>
                                    </div>
                                    {msg.sender === "user" && <Avatar text={getInitials()} />}
                                </div>
                            ))}

                            {/* Shimmer while AI thinking */}
                            {loadingAI && <ShimmerBubble />}

                            <div ref={messagesEndRef} />
                        </div>
                    ) : (
                        <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
                            <h2 className="text-4xl font-bold text-white">
                                Hello, 🖐️ {currentUser?.firstName} {currentUser?.lastName}!
                            </h2>
                            <p className="mt-2 text-lg text-slate-400">
                                Start by creating a new chat from the sidebar.
                            </p>
                        </div>
                    )}

                    {/* Input Box */}
                    <div className="border-t border-slate-700 bg-slate-800 p-4">
                        <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-lg border border-slate-600 bg-slate-700 px-2 py-1">
                            <textarea
                                placeholder="Type your message..."
                                className="min-h-[44px] w-full flex-1 resize-none bg-transparent px-2 py-2 focus:outline-none"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim()}
                                className="rounded-md bg-green-500 p-3 text-slate-900 hover:bg-green-600 disabled:opacity-50"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ChatPanel;
