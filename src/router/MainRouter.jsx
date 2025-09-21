import React from 'react'
import { Route, Routes } from 'react-router'
import Home from '../components/pages/Home.jsx'
import Login from '../components/pages/Login.jsx'
import Register from '../components/pages/Register.jsx'
import ChatPanel from '../components/pages/ChatPanel.jsx'
const MainRouter = () => {
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth/login" element={<Login />} />
                <Route path="/auth/register" element={<Register />} />
                <Route path="/api/chat-panel" element={<ChatPanel />} />
            </Routes>
        </>
    )
}

export default MainRouter
