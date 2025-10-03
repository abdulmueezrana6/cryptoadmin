import { useState, useEffect } from "react";

export const setLocalStorage = (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    localStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error("Error setting localStorage", error);
  }
};
// Lấy giá trị từ localStorage
export const getLocalStorage = (key, defaultValue = null) => {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.error("Error getting localStorage", error);
    return defaultValue;
  }
};
