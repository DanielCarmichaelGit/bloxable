import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  CreditCard,
  Calendar,
  Package,
  BarChart3,
  Mail,
  Github,
  Slack,
  Trello,
  FileText as Notion,
  Palette as Figma,
  Cloud as Dropbox,
  Globe as Google,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Twitch,
  MessageCircle as Discord,
  Workflow as Bloxable,
} from "lucide-react";

const workflowIcons = [
  { icon: Mail, color: "bg-red-500" },
  { icon: Github, color: "bg-gray-800" },
  { icon: Slack, color: "bg-purple-500" },
  { icon: Trello, color: "bg-blue-500" },
  { icon: Notion, color: "bg-gray-700" },
  { icon: Figma, color: "bg-pink-500" },
  { icon: Dropbox, color: "bg-blue-600" },
  { icon: Google, color: "bg-green-500" },
  { icon: Twitter, color: "bg-blue-400" },
  { icon: Instagram, color: "bg-pink-600" },
  { icon: Linkedin, color: "bg-blue-700" },
  { icon: Youtube, color: "bg-red-600" },
  { icon: Twitch, color: "bg-purple-600" },
  { icon: Discord, color: "bg-indigo-500" },
  { icon: Calendar, color: "bg-green-600" },
  { icon: CreditCard, color: "bg-indigo-600" },
  { icon: Package, color: "bg-green-700" },
  { icon: BarChart3, color: "bg-orange-500" },
];

export default function WorkflowIconsScroll() {
  return (
    <div className="items-center justify-center space-x-8 hidden lg:flex">
      {/* Static Bloxable logo on the left */}
      <div className="w-36 h-36 flex items-center justify-center border border-border rounded-lg shadow-sm bg-background">
        <div className="w-24 h-24 rounded-full bg-background flex border border-border items-center justify-center shadow">
          <Bloxable className="h-10 w-10 text-black dark:text-white" />
        </div>
      </div>

      {/* Scrolling column on the right */}
      <div className="w-36 h-72 overflow-hidden bg-background relative">
        {/* Top fade gradient */}
        <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-white dark:from-background to-transparent z-10 pointer-events-none"></div>

        {/* Scrolling content */}
        <div className="flex flex-col animate-scroll-vertical">
          {[...workflowIcons, ...workflowIcons].map((item, index) => (
            <div
              key={index}
              className="w-36 h-36 flex items-center justify-center border-b last:border-b-0 flex-shrink-0"
            >
              <div
                className={`w-24 h-24 rounded-full ${item.color} flex items-center justify-center text-white shadow-md`}
              >
                <item.icon className="h-8 w-8" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom fade gradient */}
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-white dark:from-background to-transparent z-10 pointer-events-none"></div>
      </div>
    </div>
  );
}
