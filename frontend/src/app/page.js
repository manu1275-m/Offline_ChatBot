"use client";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  FaRobot,
  FaPaperPlane,
  FaPlus,
  FaTrash,
  FaBolt,
  FaBrain,
  FaComments,
} from "react-icons/fa";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import toast, {
  Toaster,
} from "react-hot-toast";

export default function Home() {

  const [started, setStarted] =
  useState(false);

  const [chats, setChats] =
  useState([]);

  const [activeChatId, setActiveChatId] =
  useState(null);

  const [messages, setMessages] =
  useState([]);

  const [input, setInput] =
  useState("");

  const [loading, setLoading] =
  useState(false);

  const [contextMenu, setContextMenu] =
  useState(null);

  const chatRef = useRef(null);

  const sortChats = (chatList) => {
    return [...chatList].sort((a,b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });
  };

useEffect(() => {

  const savedChats =
  localStorage.getItem("offline_chats");

  const parsedChats =
  savedChats
  ? JSON.parse(savedChats)
  : [];

  setChats(sortChats(parsedChats));

  setActiveChatId(null);

  setMessages([]);

  setStarted(false);

}, []);

  useEffect(() => {

    localStorage.setItem(
      "offline_chats",
      JSON.stringify(chats)
    );

  }, [chats]);

  useEffect(() => {

    const closeMenu = () => {
      setContextMenu(null);
    };

    window.addEventListener("click", closeMenu);

    return () => {
      window.removeEventListener("click", closeMenu);
    };

  }, []);

  useEffect(() => {

    if (chatRef.current) {

      chatRef.current.scrollTop =
      chatRef.current.scrollHeight;

    }

  }, [messages]);

  const saveCurrentChat = (updatedMessages) => {

    if (!activeChatId) return;

    setChats((prevChats) =>
      sortChats(
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              messages: updatedMessages,
              title:
                updatedMessages[0]?.text?.slice(0, 28)
                || "New Chat",
              updatedAt: new Date().toISOString(),
            }
          : chat
      )
      )
    );

  };

  const sendMessage = async () => {

    if (!input.trim()) return;

    let currentChatId = activeChatId;

    if (!currentChatId) {

      currentChatId = Date.now().toString();

      const newChatData = {
        id: currentChatId,
        title: input.slice(0, 28),
        messages: [],
        pinned: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setChats((prev) =>
        sortChats([
          newChatData,
          ...prev,
        ])
      );

      setActiveChatId(currentChatId);

    }

    const userMessage = {

      sender: "user",

      text: input,

    };

    const updatedUserMessages = [

      ...messages,

      userMessage,

    ];

    setMessages(updatedUserMessages);

    const question = input;

    setInput("");

    setLoading(true);

    try {

      const response =
      await fetch(

        "http://127.0.0.1:8001/ask",

        {

          method: "POST",

          headers: {

            "Content-Type":
            "application/json",

          },

          body: JSON.stringify({

            question,

          }),

        }

      );

      const data =
      await response.json();

      const finalMessages = [

        ...updatedUserMessages,

        {

          sender: "bot",

          text: data.answer,

        },

      ];

      setMessages(finalMessages);

      setChats((prevChats) =>
        sortChats(
        prevChats.map((chat) =>
          chat.id === currentChatId
            ? {
                ...chat,
                messages: finalMessages,
                title:
                  finalMessages[0]?.text?.slice(0, 28)
                  || "New Chat",
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
        )
      );

    } catch {

      toast.error(
        "Backend not running"
      );

      saveCurrentChat(updatedUserMessages);

    }

    setLoading(false);

  };

  const clearChat = () => {

    setMessages([]);

    setInput("");

    if (activeChatId) {

      setChats((prevChats) =>
        sortChats(
        prevChats.map((chat) =>
          chat.id === activeChatId
            ? {
                ...chat,
                messages: [],
                title: "New Chat",
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
        )
      );

    }

  };

  const newChat = () => {

  if (
    messages.length === 0 &&
    activeChatId
  ) {
    return;
  }

  const id = Date.now().toString();

  const newChatData = {
    id,
    title: "New Chat",
    messages: [],
    pinned: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  setChats((prev) =>
    sortChats([
      newChatData,
      ...prev,
    ])
  );

  setActiveChatId(id);

  setMessages([]);

  setInput("");

  setStarted(true);

};

  const openChat = (chat) => {

    setActiveChatId(chat.id);

    setMessages(chat.messages);

    setInput("");

    setStarted(true);

  };

  const togglePinChat = (chatId) => {

    setChats((prevChats) =>
      sortChats(
        prevChats.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinned: !chat.pinned,
                updatedAt: new Date().toISOString(),
              }
            : chat
        )
      )
    );

    setContextMenu(null);

  };

  const deleteChat = (chatId) => {

    const remainingChats =
    chats.filter((chat) =>
      chat.id !== chatId
    );

    setChats(sortChats(remainingChats));

    setContextMenu(null);

    if (chatId === activeChatId) {

      if (remainingChats.length > 0) {

        const nextChat =
        sortChats(remainingChats)[0];

        setActiveChatId(nextChat.id);

        setMessages(nextChat.messages);

      } else {

        const id = Date.now().toString();

        const newChatData = {
          id,
          title: "New Chat",
          messages: [],
          pinned: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setChats([newChatData]);

        setActiveChatId(id);

        setMessages([]);

      }

    }

    setInput("");

  };

  const openContextMenu = (e, chat) => {

    e.preventDefault();

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      chat,
    });

  };

  if (!started) {

    return (

      <main className="landing">

        <Toaster />

        <div className="glow glow1"></div>

        <div className="glow glow2"></div>

        <nav className="navbar">

          <div className="nav-logo">

            <FaRobot />

            Offline Chat Bot

          </div>

          <button
            className="nav-btn"
          >
            Offline AI
          </button>

        </nav>

        <motion.div

          className="hero"

          initial={{
            opacity:0,
            y:50,
          }}

          animate={{
            opacity:1,
            y:0,
          }}

          transition={{
            duration:1,
          }}

        >

          <motion.div

            className="hero-icon"

            animate={{
              y:[0,-12,0],
            }}

            transition={{
              repeat:Infinity,
              duration:4,
            }}

          >

            <FaRobot />

          </motion.div>

          <h1>

            Offline Chat Bot

          </h1>

          <p>

            Smart Offline AI Assistant

          </p>

          <div className="hero-buttons">

            <button

              className="primary-btn"

              onClick={newChat}

            >

              Start Chatting

            </button>

            <button

              className="secondary-btn"

              onClick={() => {

                document
                .getElementById(
                  "features"
                )
                ?.scrollIntoView({

                  behavior:"smooth",

                });

              }}

            >

              Explore Features

            </button>

          </div>

        </motion.div>

        <section
          className="features"
          id="features"
        >

          {[

            {

              icon:<FaBolt />,

              title:"Fast Responses",

              desc:
              "Optimized offline AI responses with smooth experience.",

            },

            {

              icon:<FaBrain />,

              title:"Offline AI",

              desc:
              "Runs locally without internet.",

            },

            {

              icon:<FaComments />,

              title:"Smart Conversations",

              desc:
              "Supports interview prep and general conversations.",

            },

          ].map((item,index)=>(

            <motion.div

              key={index}

              className="feature-card"

              whileHover={{
                scale:1.04,
              }}

            >

              <div className="feature-icon">

                {item.icon}

              </div>

              <h3>

                {item.title}

              </h3>

              <p>

                {item.desc}

              </p>

            </motion.div>

          ))}

        </section>

      </main>
    );
  }

  return (

    <main className="chat-layout">

      <Toaster />

      {contextMenu && (

        <div
          onClick={(e) =>
            e.stopPropagation()
          }
          style={{
            position: "fixed",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 9999,
            minWidth: "170px",
            padding: "8px",
            borderRadius: "14px",
            background: "rgba(15,23,42,0.96)",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 45px rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
          }}
        >

          <button
            onClick={() =>
              togglePinChat(
                contextMenu.chat.id
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              background: "transparent",
              color: "white",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >

            {contextMenu.chat.pinned
              ? "Unpin Chat"
              : "Pin Chat"}

          </button>

          <button
            onClick={() =>
              deleteChat(
                contextMenu.chat.id
              )
            }
            style={{
              width: "100%",
              padding: "12px",
              border: "none",
              borderRadius: "10px",
              background: "transparent",
              color: "#ff6b6b",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >

            Delete Chat

          </button>

        </div>

      )}

      <aside className="sidebar">

        <div>

          <div className="sidebar-logo">

            <FaRobot />

            Offline Chat Bot

          </div>

          <button
            className="new-chat-btn"
            onClick={newChat}
          >

            <FaPlus />

            New Chat

          </button>

          <div className="chat-history">

            {chats.map((chat) => (

              <div
                key={chat.id}
                onClick={() =>
                  openChat(chat)
                }
                onContextMenu={(e) =>
                  openContextMenu(e, chat)
                }
                style={{
                  border:
                    chat.id === activeChatId
                    ? "1px solid rgba(0,255,213,0.35)"
                    : "1px solid transparent",
                }}
              >

                {chat.pinned
                  ? `📌 ${chat.title}`
                  : chat.title}

              </div>

            ))}

          </div>

        </div>

        <button

          className="clear-btn"

          onClick={clearChat}

        >

          <FaTrash />

          Clear Chat

        </button>

      </aside>

      <section className="chat-section">

        <div
          className="messages"
          ref={chatRef}
        >

          {messages.length === 0 && (

            <motion.div

              className="empty-state"

              initial={{
                opacity:0,
              }}

              animate={{
                opacity:1,
              }}

            >

              <h1>

                Welcome Back 👋

              </h1>

              <p>

                Ask interview,
                placement, coding,
                or general questions

              </p>

            </motion.div>

          )}

          <AnimatePresence>

            {messages.map(
              (msg,index)=>(

                <motion.div

                  key={index}

                  initial={{
                    opacity:0,
                    y:20,
                  }}

                  animate={{
                    opacity:1,
                    y:0,
                  }}

                  transition={{
                    duration:0.3,
                  }}

                  className={

                    msg.sender === "user"

                    ? "user-message"

                    : "bot-message"

                  }

                >

                  {msg.text}

                </motion.div>

              )
            )}

          </AnimatePresence>

          {loading && (

            <div className="typing-box">

              <span></span>
              <span></span>
              <span></span>

            </div>

          )}

        </div>

        <div className="input-container">

          <input

            type="text"

            placeholder="Ask anything..."

            value={input}

            onChange={(e)=>
              setInput(
                e.target.value
              )
            }

            onKeyDown={(e)=>

              e.key === "Enter"
              &&
              sendMessage()

            }

          />

          <button
            onClick={sendMessage}
          >

            <FaPaperPlane />

          </button>

        </div>

      </section>

    </main>
  );
}