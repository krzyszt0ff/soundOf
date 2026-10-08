import styles from "./auth.module.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
        <div className={styles.ambient}>
            <div className={`${styles.blob} ${styles.blob1}`}></div>
            <div className={`${styles.blob} ${styles.blob2}`}></div>
            <div className={`${styles.blob} ${styles.blob3}`}></div>
            <div className={`${styles.blob} ${styles.blob4}`}></div>
        </div>
      <div className="relative z-10">{children}</div>
    </>
  );
}