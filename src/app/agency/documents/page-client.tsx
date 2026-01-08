'use client';

import { useState } from 'react';
import {
    Plus,
    Search,
    FileText,
    Image,
    File,
    Folder,
    Download,
    Trash2,
    Upload,
    Grid,
    List,
} from 'lucide-react';
import { Button, Input, Badge } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';

interface Document {
    id: string;
    name: string;
    type: 'pdf' | 'image' | 'doc' | 'other';
    size: string;
    folder: string;
    uploaded_at: string;
}

interface DocumentsPageClientProps {
    documents: Document[];
    folders: string[];
}

export function DocumentsPageClient({ documents, folders }: DocumentsPageClientProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('All Files');
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFolder = selectedFolder === 'All Files' || doc.folder === selectedFolder;
        return matchesSearch && matchesFolder;
    });

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <FileText className="text-error-500" />;
            case 'image': return <Image className="text-primary-500" />;
            case 'doc': return <File className="text-primary-600" />;
            default: return <File className="text-gray-500" />;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="page-content">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Documents</h1>
                    <p className="text-secondary text-sm">Manage your files and documents</p>
                </div>
                <Button onClick={() => setShowUploadModal(true)}>
                    <Upload size={18} />
                    Upload
                </Button>
            </div>

            <div className="documents-layout">
                {/* Sidebar */}
                <div className="documents-sidebar">
                    <div className="card">
                        <div className="card-header">
                            <Folder size={18} />
                            <span>Folders</span>
                        </div>
                        <div className="folder-list">
                            {folders.map(folder => (
                                <button
                                    key={folder}
                                    className={`folder-item ${selectedFolder === folder ? 'active' : ''}`}
                                    onClick={() => setSelectedFolder(folder)}
                                >
                                    <Folder size={16} />
                                    <span>{folder}</span>
                                    <span className="folder-count">
                                        {folder === 'All Files'
                                            ? documents.length
                                            : documents.filter(d => d.folder === folder).length}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="documents-main">
                    {/* Toolbar */}
                    <div className="card mb-4">
                        <div className="card-body" style={{ padding: 'var(--spacing-3)' }}>
                            <div className="flex items-center gap-4">
                                <div style={{ flex: 1 }}>
                                    <div className="input-wrapper">
                                        <Search className="input-icon" size={18} />
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Search documents..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ paddingLeft: '40px' }}
                                        />
                                    </div>
                                </div>
                                <div className="view-toggle">
                                    <button
                                        className={viewType === 'grid' ? 'active' : ''}
                                        onClick={() => setViewType('grid')}
                                    >
                                        <Grid size={18} />
                                    </button>
                                    <button
                                        className={viewType === 'list' ? 'active' : ''}
                                        onClick={() => setViewType('list')}
                                    >
                                        <List size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Documents */}
                    {filteredDocuments.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} />
                            <p>No documents found</p>
                            <Button variant="ghost" onClick={() => setShowUploadModal(true)}>
                                Upload your first document
                            </Button>
                        </div>
                    ) : viewType === 'grid' ? (
                        <div className="documents-grid">
                            {filteredDocuments.map(doc => (
                                <div key={doc.id} className="document-card">
                                    <div className="document-preview">
                                        {getFileIcon(doc.type)}
                                    </div>
                                    <div className="document-info">
                                        <div className="document-name" title={doc.name}>{doc.name}</div>
                                        <div className="document-meta">{doc.size} • {formatDate(doc.uploaded_at)}</div>
                                    </div>
                                    <div className="document-actions">
                                        <button title="Download"><Download size={14} /></button>
                                        <button title="Delete"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card">
                            <div className="table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th>Folder</th>
                                            <th>Size</th>
                                            <th>Uploaded</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredDocuments.map(doc => (
                                            <tr key={doc.id}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {getFileIcon(doc.type)}
                                                        <span>{doc.name}</span>
                                                    </div>
                                                </td>
                                                <td><Badge variant="gray">{doc.folder}</Badge></td>
                                                <td>{doc.size}</td>
                                                <td>{formatDate(doc.uploaded_at)}</td>
                                                <td>
                                                    <div className="flex gap-1">
                                                        <Button variant="ghost" size="sm"><Download size={14} /></Button>
                                                        <Button variant="ghost" size="sm"><Trash2 size={14} /></Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            <Modal
                isOpen={showUploadModal}
                onClose={() => setShowUploadModal(false)}
                title="Upload Document"
            >
                <div className="upload-zone">
                    <Upload size={48} className="text-tertiary" />
                    <p>Drag and drop files here</p>
                    <span>or</span>
                    <Button variant="ghost">Browse Files</Button>
                    <p className="hint">Supports PDF, DOC, JPG, PNG (max 10MB)</p>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                </div>
            </Modal>

            <style jsx>{`
                .documents-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: var(--spacing-6);
                }
                .folder-list {
                    padding: var(--spacing-2);
                }
                .folder-item {
                    display: flex;
                    align-items: center;
                    gap: var(--spacing-2);
                    width: 100%;
                    padding: var(--spacing-2) var(--spacing-3);
                    border: none;
                    background: none;
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    color: var(--text-secondary);
                    font-size: 14px;
                    transition: all 0.2s ease;
                }
                .folder-item:hover {
                    background: var(--bg-secondary);
                }
                .folder-item.active {
                    background: var(--primary-50);
                    color: var(--primary-700);
                }
                .folder-count {
                    margin-left: auto;
                    font-size: 12px;
                    color: var(--text-tertiary);
                }
                .view-toggle {
                    display: flex;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                .view-toggle button {
                    padding: 8px 12px;
                    border: none;
                    background: white;
                    cursor: pointer;
                    color: var(--text-tertiary);
                    transition: all 0.2s ease;
                }
                .view-toggle button:hover {
                    background: var(--bg-secondary);
                }
                .view-toggle button.active {
                    background: var(--primary-50);
                    color: var(--primary-600);
                }
                .documents-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: var(--spacing-4);
                }
                .document-card {
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    transition: all 0.2s ease;
                }
                .document-card:hover {
                    border-color: var(--primary-200);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .document-preview {
                    height: 100px;
                    background: var(--bg-secondary);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .document-info {
                    padding: var(--spacing-3);
                }
                .document-name {
                    font-weight: 500;
                    font-size: 13px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .document-meta {
                    font-size: 11px;
                    color: var(--text-tertiary);
                    margin-top: 2px;
                }
                .document-actions {
                    display: flex;
                    border-top: 1px solid var(--border-light);
                }
                .document-actions button {
                    flex: 1;
                    padding: var(--spacing-2);
                    border: none;
                    background: none;
                    cursor: pointer;
                    color: var(--text-tertiary);
                    transition: all 0.2s ease;
                }
                .document-actions button:hover {
                    background: var(--bg-secondary);
                    color: var(--text-primary);
                }
                .document-actions button:first-child {
                    border-right: 1px solid var(--border-light);
                }
                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: var(--spacing-8);
                    background: white;
                    border: 1px solid var(--border-light);
                    border-radius: var(--radius-lg);
                    color: var(--text-tertiary);
                    gap: var(--spacing-3);
                }
                .upload-zone {
                    border: 2px dashed var(--border-light);
                    border-radius: var(--radius-lg);
                    padding: var(--spacing-8);
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: var(--spacing-2);
                }
                .upload-zone .hint {
                    font-size: 12px;
                    color: var(--text-tertiary);
                    margin-top: var(--spacing-2);
                }
                @media (max-width: 768px) {
                    .documents-layout {
                        grid-template-columns: 1fr;
                    }
                    .documents-sidebar {
                        order: 1;
                    }
                }
            `}</style>
        </div>
    );
}
