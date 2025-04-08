"use client";

import { useState } from "react";
import { FiMenu, FiX, FiChevronDown, FiChevronRight, FiChevronLeft  } from "react-icons/fi";
import { FaHome, FaUsers, FaChartBar, FaBox, FaHandHoldingHeart, FaPeopleCarry, FaCog, FaClipboardList, FaCalendarAlt, FaBoxOpen, FaShippingFast, FaHandsHelping, FaFileInvoiceDollar, FaChartPie, FaTruck, FaCheckCircle, FaChartLine } from "react-icons/fa";

import type { JSX } from "react";
const roleMenus: { [key: string]: { name: string; icon: JSX.Element; subMenu?: string[] }[] } = {
    admin: [
        { name: "Dashboard", icon: <FaHome /> },
        { name: "Users", icon: <FaUsers />, subMenu: ["All", "Roles", "Permissions"] },
        { name: "Packages", icon: <FaBox />, subMenu: ["Requests", "Custom", "Tracking"] },
        { name: "Donations", icon: <FaHandHoldingHeart />, subMenu: ["Monetary", "Items", "Inventory"] },
        { name: "Volunteers", icon: <FaPeopleCarry />, subMenu: ["Schedules", "Tasks", "Events"] },
        { name: "Reports", icon: <FaChartBar />, subMenu: ["Packages", "Donations", "Volunteers"] },
        { name: "Settings", icon: <FaCog /> },
    ],
    volunteer: [
        { name: "Dashboard", icon: <FaHome /> },
        { name: "Tasks", icon: <FaClipboardList /> },
        { name: "Events", icon: <FaCalendarAlt /> },
        { name: "Inventory", icon: <FaBoxOpen /> },
    ],
    service_member: [
        { name: "Request", icon: <FaBox /> },
        { name: "Track", icon: <FaShippingFast /> },
        { name: "Help", icon: <FaHandsHelping /> },
    ],
    donor: [
        { name: "Donate", icon: <FaHandHoldingHeart /> },
        { name: "My Donations", icon: <FaFileInvoiceDollar /> },
        { name: "Impact", icon: <FaChartPie /> },
    ],
    shipping_partner: [
        { name: "Pending", icon: <FaTruck /> },
        { name: "Completed", icon: <FaCheckCircle /> },
        { name: "Reports", icon: <FaChartLine /> },
    ],
    
  user: [{ name: "Profile", icon: <FaHome /> }, { name: "Tasks", icon: <FaChartBar /> }],
};

export default function Sidebar({ role }: { role: string }) {
  const [isExpanded, setIsExpanded] = useState(true); // Sidebar state
  const [hoverExpand, setHoverExpand] = useState(false); // Expand on hover
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  const handleMouseEnter = () => {
    if (!isExpanded) setHoverExpand(true);
  };

  const handleMouseLeave = () => {
    if (!isExpanded) setHoverExpand(false);
  };

  const toggleSubMenu = (menu: string) => {
    setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
  };

  return (
    <div className="relative flex">
      {/* Hamburger Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-10 top-4 p-2 rounded-full bg-transparent text-white hover:bg-gray-700 transition-all"
      >
        {/* {isExpanded ? <FiX size={24} /> : <FiMenu size={24} />} */}    
        {isExpanded ? <FiChevronLeft size={28} strokeWidth={4} /> : <FiChevronRight size={28} strokeWidth={4} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`h-screen bg-transparent text-white transition-all duration-500 ease-in-out border-r-2 border-slate-500 border-gray-700 ${
          isExpanded || hoverExpand ? "w-64" : "w-16"
        }`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Sidebar Header */}
        {/* <h2 className={`text-xl font-bold transition-all ${isExpanded || hoverExpand ? "opacity-100" : "opacity-0"}`}>
          Dashboard
        </h2> */}

        {/* Sidebar Menu */}
        <ul className="mt-6 space-y-2">
          {roleMenus[role.toLocaleLowerCase()]?.map((menu, index) => (
            <li key={index} className="relative">
              <button
                onClick={() => menu.subMenu && toggleSubMenu(menu.name)}
                className="flex items-center w-full p-2 rounded-lg hover:bg-gray-800 transition bg-transparent"
              >
                <span className="text-lg">{menu.icon}</span>
                <span
                  className={`ml-3 transition-all overflow-hidden whitespace-nowrap ${
                    isExpanded || hoverExpand ? "opacity-100 w-auto" : "opacity-0 w-0"
                  }`}
                >
                  {menu.name}
                </span>
                {menu.subMenu && (
                  <span className="ml-auto">
                    {openMenus[menu.name] ? <FiChevronDown /> : <FiChevronRight />}
                  </span>
                )}
              </button>

              {/* Animated Submenu */}
              {menu.subMenu && (
                <ul
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openMenus[menu.name] && (isExpanded || hoverExpand) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  {menu.subMenu.map((sub, subIndex) => (
                    <li key={subIndex} className="pl-8 py-1 text-sm text-gray-400 hover:text-white">
                      {sub}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
