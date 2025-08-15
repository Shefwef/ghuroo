import {
  useEffect,
  useState,
  useRef,
  useEffect as useEffectReact,
} from "react";
import { useNavigate } from "react-router-dom";
import { FaTrashAlt } from "react-icons/fa";

function DeleteModal({ user, onCancel, onConfirm }) {
  const modalRef = useRef(null);

 
  useEffectReact(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") onCancel();
      if (e.key === "Enter") onConfirm();
    }

    document.addEventListener("keydown", handleKeyDown);
    modalRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onCancel, onConfirm]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div
        ref={modalRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl max-w-sm w-full p-6 mx-4 outline-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <h3
          id="modal-title"
          className="text-lg font-semibold text-gray-900 mb-4"
        >
          Confirm Delete
        </h3>
        <p className="mb-6 text-gray-700">
          Are you sure you want to delete user <strong>{user.full_name}</strong>
          ? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [modalUser, setModalUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("/api/admin/users", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            navigate("/admin/login");
          }
          throw new Error("Failed to fetch users");
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [navigate]);

  const openDeleteModal = (user) => {
    setModalUser(user);
  };

  const closeDeleteModal = () => {
    setModalUser(null);
  };

  const handleDeleteUser = async () => {
    if (!modalUser) return;
    try {
      setDeletingUserId(modalUser.id);
      const response = await fetch(`/api/admin/users/${modalUser.id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      setUsers(users.filter((user) => user.id !== modalUser.id));
      closeDeleteModal();
    } catch (err) {
      setError(err.message);
      closeDeleteModal();
    } finally {
      setDeletingUserId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B47]"></div>
      </div>
    );

  if (error)
    return (
      <div className="flex items-center justify-center h-64 text-[#EF4444] font-semibold">
        Error: {error}
      </div>
    );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-wide">
          User Management
        </h1>
        <p className="text-[#64748B] text-sm max-w-xl">
          View, manage, and delete users from your platform
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-[#E8EEF7] overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC] sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0F172A]">All Users</h2>
            <span className="text-sm text-[#64748B] select-none">
              {users.length} users total
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#F1F5F9] text-gray-700">
            <thead className="bg-[#F8FAFC]">
              <tr>
                {["Username", "Email", "Role", "Actions"].map((heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider select-none"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#F1F5F9] transition-colors duration-200 cursor-default"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-[#0F172A]">
                      {user.full_name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-[#64748B]">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-[rgba(16,185,129,0.15)] text-[#10B981] border border-[rgba(16,185,129,0.3)] select-none">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openDeleteModal(user)}
                      disabled={deletingUserId === user.id}
                      className={`flex items-center gap-2 text-[#EF4444] font-semibold transition-colors duration-200 hover:text-[#DC2626] ${
                        deletingUserId === user.id
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-pointer"
                      }`}
                      aria-label={`Delete user ${user.full_name}`}
                      title="Delete User"
                    >
                      {deletingUserId === user.id ? (
                        <svg
                          className="animate-spin h-5 w-5 text-[#EF4444]"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                      ) : (
                        <FaTrashAlt />
                      )}
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="text-center py-8 text-gray-400 italic select-none"
                  >
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      
      {modalUser && (
        <DeleteModal
          user={modalUser}
          onCancel={closeDeleteModal}
          onConfirm={handleDeleteUser}
        />
      )}
    </div>
  );
}
