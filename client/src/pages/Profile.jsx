import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import {
  updateUserStart,
  updateUserSuccess,
  updateUserFailure,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOut,
} from "../redux/user/userSlice";
import toast from "react-hot-toast";

export default function Profile() {
  const { currentUser, loading, error } = useSelector((state) => state.user);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [imagePercent, setImagePercent] = useState(0);
  const [imageError, setImageError] = useState(false);
  const fileRef = useRef(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    setFormData({
      username: currentUser?.username || "",
      email: currentUser?.email || "",
      profilePicture: currentUser?.profilePicture || "",
    });

    if (currentUser?.profilePicture) {
      setAvatarPreview(currentUser.profilePicture);
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleFileUpload = async (image) => {
    if (!image) return;

    const formData = new FormData();
    formData.append("profilePicture", image);

    try {
      setImagePercent(0);
      setImageError(false);

      const res = await fetch("/api/upload/profile-picture", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setImageError(true);
        toast.error(data.message || "Error uploading image");
        return;
      }

      setFormData({ ...formData, profilePicture: data.url });
      setImagePercent(100);
      toast.success("Image uploaded successfully");
    } catch (error) {
      setImageError(true);
      toast.error("Error uploading image");
      console.error("Upload error:", error);
    }
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdateSuccess(false);

    try {
      dispatch(updateUserStart());

      // Create FormData if we have an avatar
      const data = new FormData();
      for (const key in formData) {
        data.append(key, formData[key]);
      }

      if (avatar) {
        data.append("profilePicture", avatar);
      }

      let url = "";
      let method = "";
      if (currentUser.role === "admin") {
        method = "PUT";
        url = `/api/admin/update/${currentUser._id}`;
      } else {
        method = "POST";
        url = `/api/user/update/${currentUser._id}`;
      }

      const res = await fetch(url, {
        method,
        body: avatar ? data : JSON.stringify(formData),
        headers: avatar
          ? {}
          : {
              "Content-Type": "application/json",
            },
        credentials: "include",
      });

      const responseData = await res.json();
      if (!res.ok) {
        dispatch(updateUserFailure(responseData.message));
        toast.error(responseData.message || "Update failed");
        return;
      }

      dispatch(updateUserSuccess(responseData));
      setUpdateSuccess(true);
      toast.success("Profile updated successfully!");
    } catch (error) {
      dispatch(updateUserFailure(error.message));
      toast.error("An error occurred while updating profile");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        dispatch(deleteUserFailure(data.message));
        toast.error(data.message || "Failed to delete account");
        return;
      }

      dispatch(deleteUserSuccess());
      toast.success("Account deleted successfully");
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
      toast.error("An error occurred while deleting account");
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/signout", {
        credentials: "include",
      });
      dispatch(signOut());
      toast.success("Signed out successfully");
    } catch (error) {
      console.log(error);
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="max-w-lg mx-auto p-3">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          id="username"
          placeholder="Username"
          className="border p-3 rounded-lg"
          defaultValue={formData.username}
          onChange={handleChange}
        />
        <input
          type="email"
          id="email"
          placeholder="Email"
          className="border p-3 rounded-lg"
          defaultValue={formData.email}
          onChange={handleChange}
        />
        <input
          type="password"
          id="password"
          placeholder="Password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <button
          disabled={loading}
          className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? "Loading..." : "Update"}
        </button>
      </form>
      {/* delete for users */}

      <div className="flex justify-between mt-5">
        {currentUser.role !== "admin" && (
          <span
            onClick={handleDeleteAccount}
            className="text-red-700 cursor-pointer"
          >
            Delete account
          </span>
        )}
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Sign out
        </span>
      </div>

      {error && <p className="text-red-700 mt-5">{error}</p>}
      {updateSuccess && (
        <p className="text-green-700 mt-5">User is updated successfully!</p>
      )}
    </div>
  );
}
