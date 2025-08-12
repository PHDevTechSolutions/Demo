import { FaBuildingUser } from "react-icons/fa6";
import { CiInboxIn, CiWavePulse1, CiUser, CiCircleQuestion, CiCircleInfo } from "react-icons/ci";
import TaskflowIcon from './TaskflowIcon';

interface UserDetails {
    Role: string;
    // Add other user fields if needed
}

const getMenuItems = (userId: string | null = "", userDetails?: UserDetails) => [
    {
        title: 'Inquiries',
        icon: CiInboxIn,
        subItems: [
            { title: 'Tickets', href: `/ModuleCSR/CSR/AutomatedTickets/Tickets${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
    {
        title: 'Customer Database',
        icon: FaBuildingUser,
        subItems: [
            { title: 'List of Accounts', href: `/ModuleCSR/CSR/Accounts/AccountList${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
    {
        title: 'Reports',
        icon: CiWavePulse1,
        subItems: [
            { title: 'Daily CSR Transaction', href: `/ModuleCSR/CSR/Reports/DailyTaskflowTransaction${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
            { title: 'SKU Listing', href: `/ModuleCSR/CSR/Reports/SKUListing${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
            { title: 'Received P.O', href: `/ModuleCSR/CSR/Reports/ReceivedPO${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
            { title: 'D-Tracking', href: `/ModuleCSR/CSR/Reports/DTracking${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
    {
        title: 'Taskflow',
        icon: TaskflowIcon,
        subItems: [
            {
                title: 'Outbound Calls',
                href: `/ModuleCSR/CSR/Taskflow/OutboundCall${userId ? `?id=${encodeURIComponent(userId)}` : ''}`
            },
            ...(userDetails && userDetails.Role !== 'Staff' ? [
                {
                    title: 'Database',
                    href: `/ModuleCSR/CSR/Taskflow/Database${userId ? `?id=${encodeURIComponent(userId)}` : ''}`
                }
            ] : [])
        ],
    },
    {
        title: 'User Creation',
        icon: CiUser,
        subItems: [
            { title: 'List of Users', href: `/ModuleCSR/CSR/Users/ListofUser${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
    {
        title: 'Eco Help',
        icon: CiCircleQuestion,
        subItems: [
            { title: 'CSR Faqs', href: `/ModuleCSR/CSR/Faqs${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
    {
        title: 'What is Ecodesk?',
        icon: CiCircleInfo,
        subItems: [
            { title: 'View Information', href: `/ModuleCSR/CSR/Information${userId ? `?id=${encodeURIComponent(userId)}` : ''}` },
        ],
    },
];

export default getMenuItems;
