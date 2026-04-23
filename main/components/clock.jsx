'use client'
import { useEffect, useState } from 'react'

export default function Clock({ target }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    function run() {
      let today = new Date();
      let match = today.getMonth() === 5 && today.getDate() === 15;
      setVisible(match && target.startsWith("39.63"));
    }
    run();
    const timer = setInterval(run, 60000);
    return () => clearInterval(timer);
  }, [target]);

  const [time, setTime] = useState("Loading");

  function timer() {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const gmt5 = new Date(utc + 5 * 60 * 60 * 1000);

    const pad = (n, z = 2) => n.toString().padStart(z, '0');
    let hours = gmt5.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const minutes = pad(gmt5.getMinutes());
    const seconds = pad(gmt5.getSeconds());
    const ms = pad(gmt5.getMilliseconds(), 3);
    const year = gmt5.getFullYear();
    const month = pad(gmt5.getMonth() + 1);
    const day = pad(gmt5.getDate());

    setTime(`${pad(hours)}:${minutes}:${seconds}.${ms} ${ampm}, ${year}-${month}-${day}`);
  }

  useEffect(() => {
    timer();
    const id = setInterval(timer, 9);
    return () => clearInterval(id);
  }, []);

  return <div className='font-mono'>It's {time} for me {visible && "and you"}</div>
}
