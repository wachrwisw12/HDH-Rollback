import { useState, useEffect } from "react";
import { CheckUpdate } from "../../wailsjs/go/main/App";

export default function Dashboard() {
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>ข้อตกลงการใช้งานและการรักษาความลับข้อมูล</h2>

        <div style={styles.content}>
          <p>
            การโปรแกรม HDH-Rollback ใช้สำหรับการปฏิบัติงานภายในองค์กรเท่านั้น
            ข้อมูลที่ประมวลผลจะไม่ถูกจัดเก็บหรือเผยแพร่ภายนอกระบบโดยไม่ได้รับอนุญาต
          </p>

          <p>
            ผู้ใช้งานต้องรับผิดชอบในการใช้ข้อมูลให้เป็นไปตามกฎหมายคุ้มครองข้อมูลส่วนบุคคล
            (PDPA) และนโยบายของหน่วยงาน
          </p>

          <p>
            โปรแกรมมีมาตรการควบคุมการเข้าถึงและประมวลผลข้อมูลภายในเครื่องผู้ใช้งาน
            ไม่มีการส่งข้อมูลไปยังระบบภายนอกโดยอัตโนมัติ
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: any = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "#1b2636",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: 30,
    width: 600,
    borderRadius: 10,
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  content: {
    maxHeight: 200,
    overflowY: "auto",
    marginBottom: 20,
    fontSize: 14,
    lineHeight: 1.6,
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#1b2636",
    color: "#fff",
    border: "none",
    borderRadius: 5,
    cursor: "pointer",
  },
  dashboard: {
    padding: 30,
  },
  card: {
    backgroundColor: "#f4f6f9",
    padding: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
};
