import React, { useState, useEffect } from "react";
import { 
  LuCheckCheck, 
  LuMessageCircle, 
  LuDot, 
  LuCheck, 
  LuThumbsUp, 
  LuUserPlus 
} from "react-icons/lu";
import { FaSpinner } from "react-icons/fa";
import { toast } from "react-toastify";
import { getAvatar } from "../../lib/HelperFunctions/fn"; 
import { 
  getNotifications, 
  getUnreadCount, 
  markNotificationAsRead, 
  markAllNotificationsAsRead 
} from "../../../services/notificationsService"; 

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all"); 
  const [unreadCount, setUnreadCount] = useState(0);

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  const fetchNotifsAndCount = async () => {
    try {
      setIsLoading(true);
      const isUnreadOnly = activeTab === "unread";
      const response = await getNotifications(isUnreadOnly);
      
      // 💡 التعديل هنا: الداتا جوه response.data.notifications
      setNotifications(response.data?.notifications || []);

      const countResponse = await getUnreadCount();
      // 💡 التعديل هنا: الداتا جوه response.data.unreadCount
      setUnreadCount(countResponse.data?.unreadCount || 0);

    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifsAndCount();
  }, [activeTab]);

  const handleMarkAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      if (activeTab === "unread") {
        setNotifications(prev => prev.filter(n => n._id !== id));
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
      
      if (activeTab === "unread") {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    // 💡 التعديل هنا: ضفنا like_post و comment_post عشان يلقط الأيقونة الصح
    switch(type?.toLowerCase()) {
      case "like": 
      case "like_post": 
        return <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white text-[#1877f2]"><LuThumbsUp size={12} /></span>;
      case "comment": 
      case "comment_post": 
        return <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white text-emerald-500"><LuMessageCircle size={12} /></span>;
      case "follow": 
        return <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white text-amber-500"><LuUserPlus size={12} /></span>;
      default: 
        return <span className="absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white text-[#1877f2]"><LuDot size={16} /></span>;
    }
  };

  return (
    <>
      <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl mb-10">
        <div className="border-b border-slate-200 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                Notifications
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Realtime updates for likes, comments, shares, and follows.
              </p>
            </div>
            <button 
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0 || notifications.length === 0}
              className="inline-flex cursor-pointer w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              <LuCheckCheck />
              Mark all as read
            </button>
          </div>
          
          <div className="mt-4 flex items-center gap-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition cursor-pointer ${activeTab === 'all' ? 'bg-[#1877f2] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition cursor-pointer ${activeTab === 'unread' ? 'bg-[#1877f2] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              Unread
              {unreadCount > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs ${activeTab === 'unread' ? 'bg-white text-[#1877f2]' : 'bg-[#1877f2] text-white'}`}>
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2 p-3 sm:p-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <FaSpinner className="animate-spin text-3xl text-[#1877f2]" />
            </div>
          ) : notifications.length > 0 ? (
            notifications.map((notif) => (
              <article 
                key={notif._id} 
                className={`group relative flex gap-3 rounded-xl border p-3 transition sm:rounded-2xl sm:p-4 ${notif.isRead ? 'border-slate-100 bg-white' : 'border-[#dbeafe] bg-[#edf4ff]'}`}
              >
                <div className="relative shrink-0">
                  <button type="button" className="block cursor-pointer">
                    {/* 💡 التعديل هنا: استخدمنا notif.actor بدل notif.from */}
                    <img
                      src={getAvatar(notif.actor?.photo)}
                      alt={notif.actor?.name || "User"}
                      className="h-11 w-11 rounded-full object-cover"
                    />
                  </button>
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                    <p className="text-sm leading-6 text-slate-800">
                      <button type="button" className="font-extrabold hover:text-[#1877f2] hover:underline cursor-pointer">
                        {/* 💡 التعديل هنا: استخدمنا notif.actor.name */}
                        {notif.actor?.name || "Someone"}
                      </button>{" "}
                      {/* 💡 لو الباك إند مش باعت رسالة جاهزة، هنكتبها إحنا بناءً على الـ type */}
                      {notif.message || notif.content || (notif.type === 'like_post' ? 'liked your post' : notif.type === 'comment_post' ? 'commented on your post' : 'interacted with your post')}
                    </p>
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <span className="text-xs font-semibold text-slate-500">
                        {timeAgo(notif.createdAt)}
                      </span>
                      {!notif.isRead && <LuDot className="text-[#1877f2] text-3xl -ml-2" />}
                    </div>
                  </div>

                  {!notif.isRead && (
                    <div className="mt-2 flex items-center gap-2">
                      <button 
                        onClick={() => handleMarkAsRead(notif._id)}
                        className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#1877f2] ring-1 ring-[#dbeafe] transition hover:bg-[#e7f3ff] cursor-pointer"
                      >
                        <LuCheck />
                        Mark as read
                      </button>
                    </div>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="text-center py-10 rounded-2xl border border-slate-100 bg-slate-50">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#1877f2]">
                <LuCheckCheck size={24} />
              </div>
              <p className="text-lg font-extrabold text-slate-800">You're all caught up!</p>
              <p className="mt-1 text-sm font-medium text-slate-500">No {activeTab === "unread" ? "unread " : ""}notifications right now.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}