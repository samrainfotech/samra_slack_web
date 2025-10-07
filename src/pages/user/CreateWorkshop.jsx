import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { IoMdAdd, IoMdClose } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

export default function AddWorkshop() {
  const { user } = useAuth();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

  const [form, setForm] = useState({
    location: { lat: null, lng: null },
    name: "",
    image: null,
    ownerName: "",
    ownerPhone: "",
    address: { street: "", city: "", state: "", zip: "", country: "" },
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [markerPlaced, setMarkerPlaced] = useState(false);
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  // 🗺️ Initialize Leaflet Map
  useEffect(() => {
    if (showMap && !mapRef.current) {
      const map = L.map("map-container").setView([20.5937, 78.9629], 5);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(map);

      // Try to get user's location
      map.locate({ setView: true, maxZoom: 16 }).on("locationfound", (e) => {
        const { lat, lng } = e.latlng;
        markerRef.current = L.marker([lat, lng]).addTo(map);
        setForm((prev) => ({ ...prev, location: { lat, lng } }));
        setMarkerPlaced(true);
      });

      // Add click listener for manual selection
      map.on("click", function (e) {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(map);
        }
        setForm((prev) => ({ ...prev, location: { lat, lng } }));
        setMarkerPlaced(true);
      });
    }

    // Cleanup when closing map
    return () => {
      if (!showMap && mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
    };
  }, [showMap]);

  // 🖼️ Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  async function uploadImageIfNeeded() {
    if (!form.image) return null;
    const file = form.image;
    const contentType = file.type || "image/png";
    const extension = file.name?.split(".").pop()?.toLowerCase();
    const { data } = await axios.get(
      `${BACKEND_URL}/uploads/workshop-image-post`,
      { params: { contentType, extension } }
    );
    const { url, fields, publicUrl } = data.data;
    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v));
    formData.append("file", file);
    const resp = await fetch(url, { method: "POST", body: formData });
    if (!resp.ok) {
      const errorText = await resp.text();
      console.error("S3 POST error:", errorText);
      throw new Error("S3 upload failed: " + (errorText?.slice(0, 200) || resp.status));
    }
    return publicUrl;
  }

  // 🚀 Submit
  const submit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const imageUrl = await uploadImageIfNeeded();

      await axios.post(`${BACKEND_URL}/workshops`, {
        name: form.name,
        ownerName: form.ownerName,
        ownerPhone: form.ownerPhone,
        location: { lat: form.location.lat, lng: form.location.lng },
        address: { ...form.address },
        image: imageUrl || null,
      });

      toast.success("Workshop added successfully");

      setForm({
        location: { lat: null, lng: null },
        name: "",
        image: null,
        ownerName: "",
        ownerPhone: "",
        address: { street: "", city: "", state: "", zip: "", country: "" },
      });
      setPreview(null);
    } catch (e) {
      const apiMsg = e?.response?.data?.message;
      const apiErrors = e?.response?.data?.errors;
      if (apiErrors && Array.isArray(apiErrors) && apiErrors.length) {
        const first = apiErrors[0];
        toast.error(`${first.field}: ${first.message}`);
      } else if (apiMsg) {
        toast.error(apiMsg);
      } else {
        toast.error("Failed to add workshop");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🧱 Render
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
        Add New Workshop
      </h1>

      <form onSubmit={submit} className="space-y-5" encType="multipart/form-data">
        {/* Workshop Name */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Workshop Name
          </label>
          <input
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
            placeholder="Enter workshop name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        {/* Location */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Location
          </label>
          <div
            onClick={() => setShowMap(true)}
            className="p-3 w-full rounded-lg border border-gray-300 cursor-pointer bg-gray-50 hover:bg-gray-100 text-gray-600"
          >
            {form.location.lat && form.location.lng ? (
              <span>
                📍 {form.location.lat.toFixed(4)}, {form.location.lng.toFixed(4)}
              </span>
            ) : (
              <span className="text-gray-400">Select Location</span>
            )}
          </div>
        </div>

        {/* 🖼️ Image Upload */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Workshop Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
          />
          {preview && (
            <img
              src={preview}
              alt="Workshop Preview"
              className="mt-3 w-full max-h-64 object-cover rounded-lg shadow"
            />
          )}
        </div>

        {/* Owner Info */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Owner Name
            </label>
            <input
              className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Enter owner's name"
              required
              value={form.ownerName}
              onChange={(e) => setForm({ ...form, ownerName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Owner Phone
            </label>
            <input
              type="tel"
              className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="10-digit phone number"
              required
              value={form.ownerPhone}
              onChange={(e) =>
                setForm({ ...form, ownerPhone: e.target.value })
              }
            />
          </div>
        </div>

        {/* Address */}
        <div className="grid md:grid-cols-2 gap-4">
          {["street", "city", "state", "zip", "country"].map((field) => (
            <div
              key={field}
              className={field === "country" ? "md:col-span-2" : ""}
            >
              <label className="block font-semibold mb-1 text-gray-700 capitalize">
                {field}
              </label>
              <input
                className="p-3 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder={`Enter ${field}`}
                required
                value={form.address[field]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    address: { ...form.address, [field]: e.target.value },
                  })
                }
              />
            </div>
          ))}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 flex items-center justify-center gap-2 p-3 rounded-lg text-white font-semibold hover:bg-indigo-700 duration-200 w-full"
        >
          {loading ? (
            <AiOutlineLoading3Quarters className="animate-spin text-lg" />
          ) : (
            <>
              Add Workshop <IoMdAdd className="text-xl" />
            </>
          )}
        </button>
      </form>

      {/* 🌍 Map Modal */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-[95%] h-[85%] shadow-lg flex flex-col overflow-hidden">
            <div id="map-container" className="flex-1 w-full"></div>

            {/* Buttons below map */}
            <div className="flex justify-center gap-4 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowMap(false)}
                className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 flex items-center gap-1"
              >
                <IoMdClose /> Close
              </button>

              <button
                disabled={!markerPlaced}
                onClick={() => {
                  if (markerPlaced) {
                    toast.success("Location selected!");
                    setShowMap(false);
                  } else {
                    toast.error("Please select a location first!");
                  }
                }}
                className={`px-6 py-2 rounded-lg font-semibold shadow flex items-center gap-1 ${
                  markerPlaced
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                }`}
              >
                Confirm Location
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
