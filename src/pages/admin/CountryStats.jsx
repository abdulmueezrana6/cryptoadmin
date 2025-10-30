import React, { useState, useEffect } from "react";
import { collection, query, getDocs, where } from "firebase/firestore";
import { db } from "../../firebase";
import Select from "react-select";
export default function CountryStats() {
  const [countriesData, setCountriesData] = useState([]);
  const [country, setCountry] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Lấy toàn bộ dữ liệu từ Firestore và tổng hợp theo quốc gia
  const fetchAllData = async () => {
  setLoading(true);
  try {
    //const q = query(collection(db, "mydata"));
    const q = query(
    collection(db, "mydata"),           // tên collection
    where("s", "!=", 0)             // điều kiện where
    );
    const snapshot = await getDocs(q);
    const stats = new Map();
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Gộp mọi trường hợp thiếu country hoặc ip rỗng vào "Unknown"
      let country = "Unknown";
      if (data?.ip && typeof data.ip === "object" && data.ip.country) {
        country = data.ip.country;
      }
      
      let value = 0;

      const total = data?.total;

      // Nếu đã là số, dùng trực tiếp
      if (typeof total === "number") {
        value = total;
      }
      // Nếu là chuỗi, làm sạch rồi parse
      else if (typeof total === "string") {
        const rawValue = total.replace(/[^0-9.\-]/g, ""); // loại ký tự không hợp lệ
        const parsed = parseFloat(rawValue);
        value = isNaN(parsed) ? 0 : parsed;
      }

      if (!stats.has(country)) {
        stats.set(country, { country, total: 0, count: 0 });
      }

      const c = stats.get(country);
      c.total += value;
      c.count += 1;
    });

    const result = Array.from(stats.values()).sort((a, b) => {
      if (b.total === a.total) return b.count - a.count;
      return b.total - a.total;
    });

    setCountriesData(result);
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchAllData();
  }, []);

  // 🔹 Lọc dữ liệu theo quốc gia khi người dùng chọn
  const filteredData = country
    ? countriesData.filter((c) => c.country === country.value)
    : countriesData;

  const totalCountries = countriesData.length;
  const totalRows = countriesData.reduce((sum, c) => sum + c.count, 0);
  const grandTotal = countriesData.reduce((sum, c) => sum + c.total, 0);

  const countryOptions = countriesData.map((c) => ({
    value: c.country,
    label: c.country,
  }));

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 p-8">
      <div className="w-full bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          📊 Bảng thống kê theo quốc gia
        </h2>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <>
            {/* 🔍 Thanh chọn quốc gia */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1">
                <Select
                  options={countryOptions}
                  value={country}
                  onChange={setCountry}
                  placeholder="Tìm hoặc chọn quốc gia..."
                  isClearable
                  className="text-gray-700"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderRadius: "0.75rem",
                      borderColor: state.isFocused ? "#3b82f6" : "#d1d5db",
                      boxShadow: state.isFocused
                        ? "0 0 0 2px rgba(59,130,246,0.3)"
                        : "none",
                      "&:hover": { borderColor: "#3b82f6" },
                    }),
                  }}
                />
              </div>
              {country && (
                <button
                  onClick={() => setCountry(null)}
                  className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300 text-gray-700 font-medium transition"
                >
                  Hiển thị tất cả
                </button>
              )}
            </div>

            {/* 🧮 Card tổng */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 text-center">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Tổng số quốc gia</p>
                <p className="text-2xl font-bold text-blue-700">{totalCountries}</p>
              </div>
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Tổng số dòng</p>
                <p className="text-2xl font-bold text-purple-700">
                  {totalRows.toLocaleString()}
                </p>
              </div>
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 shadow-sm">
                <p className="text-gray-500 text-sm">Tổng giá trị total</p>
                <p className="text-2xl font-bold text-green-700">
                  {grandTotal.toLocaleString()}
                </p>
              </div>
            </div>

            {/* 📋 Bảng dữ liệu */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 rounded-xl">
                <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2 text-left">Quốc gia</th>
                    <th className="px-4 py-2 text-right">Số dòng</th>
                    <th className="px-4 py-2 text-right">Tổng giá trị</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((row, i) => (
                    <tr
                      key={row.country}
                      className={`border-t border-gray-100 hover:bg-gray-50 transition ${
                        i % 2 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="px-4 py-2 font-medium text-gray-800">
                        {row.country}
                      </td>
                      <td className="px-4 py-2 text-right text-gray-700">
                        {row.count.toLocaleString()}
                      </td>
                      <td className="px-4 py-2 text-right text-green-700 font-semibold">
                        {row.total.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
