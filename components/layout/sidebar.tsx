'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  LayoutDashboard, 
  Upload, 
  Users, 
  Settings,
  Bell,
  LogOut,
  Menu,
  X,
  Activity,
  Archive
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { User } from '@/lib/types';
import { logout, getRolePermissions } from '@/lib/auth';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ currentUser, activeTab, onTabChange }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const router = useRouter();
  const permissions = getRolePermissions(currentUser.role);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navigation = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      show: true 
    },
    { 
      id: 'documents', 
      label: 'Documents', 
      icon: FileText, 
      show: true 
    },
    { 
      id: 'upload', 
      label: 'Upload', 
      icon: Upload, 
      show: permissions.canUpload 
    },
    { 
      id: 'tracking', 
      label: 'Tracking', 
      icon: Activity, 
      show: true 
    },
    { 
      id: 'archive', 
      label: 'Archive', 
      icon: Archive, 
      show: true 
    },
    { 
      id: 'users', 
      label: 'Users', 
      icon: Users, 
      show: permissions.canManageUsers 
    },
    { 
      id: 'notifications', 
      label: 'Notifications', 
      icon: Bell, 
      show: true 
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings, 
      show: true 
    }
  ];

  const getRoleColor = (role: string) => {
    const colors = {
      Admin: 'bg-red-100 text-red-800',
      HR: 'bg-blue-100 text-blue-800',
      Accounting: 'bg-green-100 text-green-800',
      Audit: 'bg-purple-100 text-purple-800'
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={cn(
      "h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center space-x-2",
            isCollapsed && "justify-center"
          )}>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-gray-900 text-sm">VenviDocs</span>
                <span className="text-xs text-gray-500 leading-tight">Smarter Document Workflows, Powered by VMIS</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className={cn(
          "flex items-center space-x-3",
          isCollapsed && "justify-center"
        )}>
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
            <AvatarFallback>{currentUser.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentUser.name}
              </p>
              <Badge 
                variant="secondary" 
                className={cn("text-xs", getRoleColor(currentUser.role))}
              >
                {currentUser.role}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.filter(item => item.show).map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeTab === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-10",
                isCollapsed && "justify-center px-0"
              )}
              onClick={() => onTabChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {!isCollapsed && (
                <span className="ml-2">{item.label}</span>
              )}
            </Button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start h-10 text-red-600 hover:text-red-700 hover:bg-red-50",
            isCollapsed && "justify-center px-0"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && (
            <span className="ml-2">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );
}