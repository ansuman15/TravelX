'use client';

export default function AdminLoading() {
    return (
        <div className="loading-container">
            <div className="loading-spinner" />
            <style jsx>{`
                .loading-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 400px;
                    width: 100%;
                }
                .loading-spinner {
                    width: 40px;
                    height: 40px;
                    border: 3px solid var(--border-light);
                    border-top-color: var(--primary-500);
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
