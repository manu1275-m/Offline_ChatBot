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

  const [messages, setMessages] =
  useState([]);

  const [input, setInput] =
  useState("");

  const [loading, setLoading] =
  useState(false);

  const chatRef = useRef(null);

  useEffect(() => {

    if (chatRef.current) {

      chatRef.current.scrollTop =
      chatRef.current.scrollHeight;

    }

  }, [messages]);

  // SEND MESSAGE

  const sendMessage = async () => {

    if (!input.trim()) return;

    const userMessage = {

      sender: "user",

      text: input,

    };

    setMessages((prev) => [

      ...prev,

      userMessage,

    ]);

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

      setMessages((prev) => [

        ...prev,

        {

          sender: "bot",

          text: data.answer,

        },

      ]);

    } catch {

      toast.error(
        "Backend not running"
      );

    }

    setLoading(false);

  };

  // CLEAR CHAT

  const clearChat = () => {

    setMessages([]);

    toast.success(
      "Chat Cleared"
    );

  };

  // SUGGESTIONS

  const suggestions = [

    "Top HR Questions",

    "Tell me about yourself",

    "Java Interview Questions",

    "DSA Questions",

    "Resume Tips",

    "General Conversation",

  ];

  // LANDING PAGE

  if (!started) {

    return (

      <main className="landing">

        <Toaster />

        {/* GLOW */}

        <div className="glow glow1"></div>

        <div className="glow glow2"></div>

        {/* NAVBAR */}

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

        {/* HERO */}

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
            for Placements, Interviews,
            DSA, Resume Preparation
            and General Conversations

          </p>

          {/* BUTTONS */}

          <div className="hero-buttons">

            <button

              className="primary-btn"

              onClick={() =>
                setStarted(true)
              }

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

        {/* FEATURES */}

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

              title:"Offline Phi AI",

              desc:
              "Runs locally without internet using Phi AI model.",

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

  // CHAT PAGE

  return (

    <main className="chat-layout">

      <Toaster />

      {/* SIDEBAR */}

      <aside className="sidebar">

        <div>

          <div className="sidebar-logo">

            <FaRobot />

            Offline Chat Bot

          </div>

          <button
            className="new-chat-btn"
          >

            <FaPlus />

            New Chat

          </button>

          {/* HISTORY */}

          <div className="chat-history">

            <div>
              HR Interview
            </div>

            <div>
              DSA Practice
            </div>

            <div>
              Resume Preparation
            </div>

            <div>
              General Conversation
            </div>

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

      {/* CHAT */}

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

              {/* SUGGESTIONS */}

              <div className="suggestion-grid">

                {suggestions.map(
                  (item,index)=>(

                    <button

                      key={index}

                      onClick={() =>
                        setInput(item)
                      }

                    >

                      {item}

                    </button>

                  )
                )}

              </div>

            </motion.div>

          )}

          {/* MESSAGES */}

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

          {/* LOADING */}

          {loading && (

            <div className="typing-box">

              <span></span>
              <span></span>
              <span></span>

            </div>

          )}

        </div>

        {/* INPUT */}

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