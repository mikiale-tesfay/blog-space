import React from "react";
import StudentSidebar from "./StudentSidebar";
import StudentTopbar from "./StudentTopbar";
import { Outlet } from "react-router-dom";

const StudentDashboard = () => {
  return (
    <div className="w-full bg-white dark:bg-muted">
      {/* Sidebar */}

      {/* <StudentSidebar />
       */}

      <StudentTopbar />

      {/* Pages */}
      <div className="w-full min-h-full px-2 dark:rounded-2xl bg-background">
        <Outlet />
      </div>
    </div>
  );
};

export default StudentDashboard;
