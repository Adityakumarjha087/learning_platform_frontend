import React from 'react';
import { SettingOutlined } from '@ant-design/icons';

interface Course {
  _id: string;
  title: string;
  description: string;
  enrolledStudents: number;
  enrolledUsers: {
    _id: string;
    name: string;
    email: string;
  }[];
  price: number;
}

interface CourseCardProps {
  course: Course;
  expandedCourse: string | null;
  onToggleEnrolledUsers: (courseId: string) => void;
  onManage: () => void;
}

const CourseCard: React.FC<CourseCardProps> = React.memo(({
  course,
  expandedCourse,
  onToggleEnrolledUsers,
  onManage,
}) => {
  const isExpanded = expandedCourse === course._id;
  const studentsPanelId = `enrolled-students-${course._id}`;

  return (
    <div className="card hover:shadow-2xl transition-shadow duration-300 bg-white dark:bg-gray-800 border-0 rounded-2xl shadow-xl p-6 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-2 sm:gap-0">
        <div className="w-full sm:w-auto">
          <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300 mb-2 truncate">{course.title}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4 min-h-[48px]">{course.description}</p>
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {course.enrolledStudents} {course.enrolledStudents === 1 ? 'student' : 'students'} enrolled
            </span>
            <button
              type="button"
              onClick={() => onToggleEnrolledUsers(course._id)}
              aria-expanded={isExpanded}
              aria-controls={studentsPanelId}
              className="text-primary-400 hover:text-primary-300 text-sm rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400"
            >
              {expandedCourse === course._id ? 'Hide Students' : 'Show Students'}
            </button>
            <button
              type="button"
              onClick={onManage}
              aria-label={`Manage ${course.title}`}
              className="px-3 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold shadow hover:from-pink-600 hover:to-purple-600 transition text-xs focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-400 focus-visible:ring-offset-2"
            >
              <SettingOutlined className="mr-1" aria-hidden="true" />Manage
            </button>
          </div>
        </div>
        <div className="text-lg font-semibold text-pink-600 dark:text-pink-400">
          ₹{course.price}
        </div>
      </div>
      {isExpanded && (
        <div id={studentsPanelId} className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Enrolled Students</h4>
          {course.enrolledUsers && course.enrolledUsers.length > 0 ? (
            <div className="space-y-2">
              {course.enrolledUsers.map((user) => (
                <div
                  key={user._id}
                  className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="text-gray-900 dark:text-white font-medium">{user.name}</p>
                    <p className="text-gray-500 dark:text-gray-300 text-sm">{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No students enrolled yet</p>
          )}
        </div>
      )}
    </div>
  );
});

CourseCard.displayName = 'CourseCard';

export default CourseCard; 