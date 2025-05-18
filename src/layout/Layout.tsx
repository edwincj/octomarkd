import { type FC } from "react";
import { Outlet, NavLink } from "react-router";
import { Bookmark, FolderGit, Search } from "lucide-react";

const Layout: FC = () => {
  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <Search className="h-5 w-5" />,
    },
    {
      name: "Bookmarks",
      href: "/bookmarks",
      icon: <Bookmark className="h-5 w-5" />,
    },
  ];
  return (
    <div className="flex flex-col w-full min-h-screen">
      <header className="sticky top-0 z-10 border-b bg-background px-8">
        <div className="flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard">
              <div className="flex items-center gap-2">
                <FolderGit className="h-6 w-6" />
                <span className="text-xl font-bold">OctoMarkD</span>
              </div>
            </NavLink>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-2 text-sm font-medium ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                {item.icon}
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="flex-1 p-8 w-full">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
