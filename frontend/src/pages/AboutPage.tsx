import { useEffect, useState } from "react";
import { GetVersion, CheckUpdate } from "../../wailsjs/go/main/App";

export default function About() {
  const [version, setVersion] = useState("");
  const [updateMsg, setUpdateMsg] = useState("");

  useEffect(() => {
    const loadVersion = async () => {
      const v = await GetVersion();
      setVersion(v);
    };
    loadVersion();
  }, []);

  const handleCheckUpdate = async () => {
    try {
      const updateInfo = await CheckUpdate();

      if (updateInfo.version !== version) {
        setUpdateMsg(`มีเวอร์ชันใหม่ ${updateInfo.version}`);
        window.open(updateInfo.url);
      } else {
        setUpdateMsg("คุณใช้เวอร์ชันล่าสุดแล้ว");
      }
    } catch (err) {
      setUpdateMsg("ตรวจสอบไม่สำเร็จ");
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>About</h2>
      <p>Version: {version}</p>

      <button onClick={handleCheckUpdate}>Check Update</button>

      <p>{updateMsg}</p>
    </div>
  );
}
