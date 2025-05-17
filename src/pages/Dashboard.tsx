import { type FC } from "react";

const Dashboard: FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight">Search GitHub</h1>
      <p className="text-muted-foreground">
        Search for GitHub users and repositories
      </p>
    </div>
  );
};

export default Dashboard;
