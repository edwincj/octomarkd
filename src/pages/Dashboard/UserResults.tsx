import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavLink } from "react-router";
import { UserRepositoriesModal } from "./UserRepoModal";
import type { GitUser } from "@/types";

interface UserSearchResultsProps {
  users: Array<GitUser>;
}

export function UserResults({ users }: UserSearchResultsProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleViewRepositories = (username: string) => {
    setSelectedUser(username);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  return (
    <div className="mt-6 space-y-4">
      <h2 className="text-2xl font-bold">Users</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar>
                <AvatarImage src={user.avatar_url} alt={user.login} />
                <AvatarFallback>
                  {user.login.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{user.login}</CardTitle>
                <CardDescription>
                  <NavLink
                    to={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Profile
                  </NavLink>
                </CardDescription>
              </div>
            </CardHeader>
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleViewRepositories(user.login)}
              >
                View Repositories
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <UserRepositoriesModal
        username={selectedUser}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
