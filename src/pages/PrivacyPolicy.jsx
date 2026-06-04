// File: Client/src/pages/PrivacyPolicy.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import styles from '../styles/PrivacyPolicy.module.css';

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <h1 className={styles.title}>Privacy Policy for INKoMOD</h1>
                <p className={styles.date}>Effective Date: May 25, 2026</p>

                <section className={styles.section}>
                    <h2>1. Introduction</h2>
                    <p>Onea Marius Daniel ("Developer", "we", "us", or "our") operates the INKoMOD mobile application ("App"). This Privacy Policy outlines the collection, use, and protection of personal data when utilizing the App.</p>
                </section>

                <section className={styles.section}>
                    <h2>2. Information Collection and Use</h2>
                    <p>To provide the core functionalities of the App, including cross-session progression and global leaderboards, specific data points are collected and transmitted to our secure backend servers:</p>
                    <ul>
                        <li><strong>Account Information:</strong> When creating an account, we collect authentication credentials (username and encrypted password).</li>
                        <li><strong>Game Data:</strong> We store in-game progression, inventory status, knight parameters, and chronological event logs to facilitate the "Load Game" and "Hall of Fame" systems.</li>
                        <li><strong>Log Data:</strong> Standard server interactions may record network data, including IP addresses, device types, and operating system versions for diagnostic and security purposes.</li>
                    </ul>
                </section>

                <section className={styles.section}>
                    <h2>3. Data Storage and Security</h2>
                    <p>Data is securely transmitted and stored utilizing a MongoDB database architecture. We employ standard cryptographic practices to protect authentication credentials. However, no method of electronic transmission or server storage guarantees absolute security.</p>
                </section>

                <section className={styles.section}>
                    <h2>4. Data Sharing and Disclosure</h2>
                    <p>We do not sell, trade, or rent user personal identification information to external parties. Data may only be disclosed if required by law or to protect the integrity of the application infrastructure.</p>
                </section>

                <section className={styles.section}>
                    <h2>5. Children's Privacy</h2>
                    <p>The App is not directed toward individuals under the age of 13. We do not knowingly collect personally identifiable information from children under 13. If we discover that a child under 13 has provided personal information, it will be immediately deleted from the servers.</p>
                </section>

                <section className={styles.section}>
                    <h2>6. User Rights</h2>
                    <p>Users possess the right to request the deletion of their data. The App includes an internal mechanism to permanently erase "Chronicles" (save files). Complete account deletion requests can be directed to the contact information provided below.</p>
                </section>

                <section className={styles.section}>
                    <h2>7. Changes to This Privacy Policy</h2>
                    <p>This Privacy Policy may be updated periodically. Continued use of the App following modifications constitutes acceptance of the revised terms.</p>
                </section>

                <section className={styles.section}>
                    <h2>8. Contact Information</h2>
                    <p>For questions regarding this Privacy Policy, please contact: mariussaudaniel@gmail.com</p>
                </section>

                <div className={styles.footer}>
                    <Button variant="secondary" onClick={() => navigate('/login')}>Return</Button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;