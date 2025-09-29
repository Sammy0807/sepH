'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import '../../style.css';
import { 
  fetchMessages, 
  createMessage, 
  deleteMessage, 
  fetchMessageStats,
  type PushMessage,
  type MessageStats
} from '../../lib/api/pushMessages';
import { 
  fetchUserAudiences,
  type UserAudience
} from '../../lib/api/userAudience';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Push Messages State
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return '#059669';
      case 'Scheduled': return '#dc2626';
      case 'Draft': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatMessageTime = (message: PushMessage) => {
    if (message.status === 'Draft') {
      return `Created ${new Date(message.createdAt).toLocaleDateString()}`;
    }
    if (message.status === 'Scheduled') {
      return `${message.sendDate} at ${message.sendTime} UTC`;
    }
    return `${message.sendDate} at ${message.sendTime} UTC`;
  };

  const [messageForm, setMessageForm] = useState({
    title: '',
    content: '',
    sendDate: '',
    sendTime: '09:00',
    timezoneStrategy: 'utc',
    targetAudience: 'All Users'
  });
  
  const [messageHistory, setMessageHistory] = useState<PushMessage[]>([]);
  const [historyFilter, setHistoryFilter] = useState('all');
  const [messageStats, setMessageStats] = useState<MessageStats>({
    sentToday: 0,
    deliveryRate: 0,
    openRate: 0,
    scheduled: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [viewingMessage, setViewingMessage] = useState<PushMessage | null>(null);
  const [deletingMessage, setDeletingMessage] = useState<{ id: string; title: string } | null>(null);
  const [userAudiences, setUserAudiences] = useState<UserAudience[]>([]);
  const [audienceLoading, setAudienceLoading] = useState(false);

  // Load data on component mount and when filter changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');
        const messages = await fetchMessages(historyFilter);
        setMessageHistory(messages);
        
        // Only load stats on initial load or when filter is 'all'
        if (historyFilter === 'all') {
          const stats = await fetchMessageStats();
          setMessageStats(stats);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [historyFilter]);

  // Load user audiences on component mount
  useEffect(() => {
    const loadUserAudiences = async () => {
      try {
        setAudienceLoading(true);
        const audiences = await fetchUserAudiences(true);
        setUserAudiences(audiences);
      } catch (err) {
        console.error('Failed to load user audiences:', err);
        // Don't show error to user for this - it's not critical
      } finally {
        setAudienceLoading(false);
      }
    };
    
    loadUserAudiences();
  }, []);

  // Auto-dismiss success messages after 45 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 45000); // 45 seconds
      
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Auto-dismiss validation errors after 45 seconds
  useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError('');
      }, 45000); // 45 seconds
      
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Auto-dismiss error messages after 45 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 45000); // 45 seconds
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const messages = await fetchMessages(historyFilter);
      setMessageHistory(messages);
      
      const stats = await fetchMessageStats();
      setMessageStats(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Message form handlers
  const handleInputChange = (field: string, value: string | string[]) => {
    setMessageForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAudienceChange = (audience: string) => {
    setMessageForm(prev => ({
      ...prev,
      targetAudience: audience
    }));
  };

  const handleSaveDraft = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      setValidationError('');
      
      await createMessage({
        ...messageForm,
        targetAudience: [messageForm.targetAudience],
        status: 'Draft'
      });
      
      // Reset form and reload data
      setMessageForm({
        title: '',
        content: '',
        sendDate: '',
        sendTime: '09:00',
        timezoneStrategy: 'utc',
        targetAudience: 'All Users'
      });
      
      await loadData();
      setSuccessMessage('Message saved as draft!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleMessage = async () => {
    if (!messageForm.title || !messageForm.content || !messageForm.sendDate) {
      setValidationError('Please fill in all required fields (title, content, and send date)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      setValidationError('');
      
      await createMessage({
        ...messageForm,
        targetAudience: [messageForm.targetAudience],
        status: 'Scheduled'
      });
      
      // Reset form and reload data
      setMessageForm({
        title: '',
        content: '',
        sendDate: '',
        sendTime: '09:00',
        timezoneStrategy: 'utc',
        targetAudience: 'All Users'
      });
      
      await loadData();
      setSuccessMessage('Message scheduled successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to schedule message');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = (message: PushMessage) => {
    setViewingMessage(message);
  };

  const handleCancelMessage = (messageId: string, messageTitle?: string) => {
    // Show confirmation modal
    setDeletingMessage({ 
      id: messageId, 
      title: messageTitle || 'Untitled Message' 
    });
  };

  const confirmCancelMessage = async () => {
    if (!deletingMessage) return;

    try {
      setLoading(true);
      setError('');
      setSuccessMessage('');
      setValidationError('');
      
      await deleteMessage(deletingMessage.id);
      await loadData();
      setSuccessMessage('Message cancelled successfully!');
      setDeletingMessage(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel message');
      setDeletingMessage(null);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ 
      display: 'flex',
      minHeight: '100vh',
      background: '#f4f6fb'
    }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        background: '#fff',
        borderRight: '1px solid #e5e7eb',
        padding: '2rem 0',
        boxShadow: '2px 0 10px rgba(0,0,0,0.05)'
      }}>
        {/* Logo/Header */}
        <div style={{ 
          padding: '0 2rem',
          marginBottom: '2rem',
          borderBottom: '1px solid #e5e7eb',
          paddingBottom: '2rem'
        }}>
          <h1 style={{ 
            color: '#004d40',
            fontSize: '1.5rem',
            margin: 0,
            fontWeight: 'bold'
          }}>
            <i className="fa-solid fa-shield-halved"></i> Admin Panel
          </h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0', fontSize: '0.9rem' }}>
            SEP Health Management
          </p>
        </div>

        {/* Navigation Menu */}
        <nav style={{ padding: '0 1rem' }}>
          {[
            { id: 'overview', icon: 'fa-chart-line', label: 'Admin Overview' },
            { id: 'users', icon: 'fa-users', label: 'User Management' },
            { id: 'messages', icon: 'fa-bell', label: 'Push Messages' },
            { id: 'wellness', icon: 'fa-heart', label: 'Wellness Data' },
            { id: 'reports', icon: 'fa-file-medical', label: 'System Reports' },
            { id: 'appointments', icon: 'fa-calendar', label: 'Appointments' },
            { id: 'analytics', icon: 'fa-chart-bar', label: 'Analytics' },
            { id: 'settings', icon: 'fa-cog', label: 'System Settings' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '1rem 1.5rem',
                margin: '0.25rem 0',
                background: activeTab === item.id ? '#e6f7f5' : 'transparent',
                color: activeTab === item.id ? '#004d40' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: activeTab === item.id ? '600' : '400',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem'
              }}
            >
              <i className={`fa-solid ${item.icon}`}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '2rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            color: '#1f2937',
            fontSize: '2rem',
            margin: 0,
            fontWeight: 'bold'
          }}>
            Admin Dashboard
          </h2>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0 0' }}>
            System management and user oversight
          </p>
        </div>

        {/* Success/Error/Validation Messages */}
        {(error || successMessage || validationError) && (
          <div style={{ marginBottom: '2rem' }}>
            {error && (
              <div style={{
                padding: '1rem 1.5rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-triangle-exclamation" style={{ 
                    color: '#dc2626', 
                    marginRight: '0.75rem',
                    fontSize: '1.1rem'
                  }}></i>
                  <span style={{ color: '#dc2626', fontWeight: '500' }}>{error}</span>
                </div>
                <button
                  onClick={() => setError('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
            
            {successMessage && (
              <div style={{
                padding: '1rem 1.5rem',
                background: '#dcfce7',
                border: '1px solid #bbf7d0',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-circle-check" style={{ 
                    color: '#059669', 
                    marginRight: '0.75rem',
                    fontSize: '1.1rem'
                  }}></i>
                  <span style={{ color: '#059669', fontWeight: '500' }}>{successMessage}</span>
                </div>
                <button
                  onClick={() => setSuccessMessage('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
            
            {validationError && (
              <div style={{
                padding: '1rem 1.5rem',
                background: '#fef3cd',
                border: '1px solid #fde68a',
                borderRadius: '8px',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <i className="fa-solid fa-exclamation-triangle" style={{ 
                    color: '#d97706', 
                    marginRight: '0.75rem',
                    fontSize: '1.1rem'
                  }}></i>
                  <span style={{ color: '#d97706', fontWeight: '500' }}>{validationError}</span>
                </div>
                <button
                  onClick={() => setValidationError('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#d97706',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div>
            {/* Quick Stats */}
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {[
                { 
                  title: 'Total Users', 
                  value: '1,247', 
                  icon: 'fa-users', 
                  color: '#059669',
                  trend: '+23 new this week'
                },
                { 
                  title: 'Active Sessions', 
                  value: '342', 
                  icon: 'fa-activity', 
                  color: '#2563eb',
                  trend: 'Currently online'
                },
                { 
                  title: 'Wellness Assessments', 
                  value: '89', 
                  icon: 'fa-heart-pulse', 
                  color: '#dc2626',
                  trend: 'Completed today'
                },
                { 
                  title: 'System Health', 
                  value: '99.8%', 
                  icon: 'fa-server', 
                  color: '#7c3aed',
                  trend: 'All systems operational'
                }
              ].map((stat, index) => (
                <div
                  key={index}
                  style={{
                    background: '#fff',
                    padding: '1.5rem',
                    borderRadius: '12px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                    border: '1px solid #f3f4f6'
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{ 
                      color: '#6b7280',
                      fontSize: '0.9rem',
                      margin: 0,
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {stat.title}
                    </h3>
                    <i 
                      className={`fa-solid ${stat.icon}`}
                      style={{ color: stat.color, fontSize: '1.2rem' }}
                    ></i>
                  </div>
                  <p style={{ 
                    color: '#1f2937',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    margin: '0 0 0.5rem 0'
                  }}>
                    {stat.value}
                  </p>
                  <p style={{ 
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    margin: 0
                  }}>
                    {stat.trend}
                  </p>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                color: '#1f2937',
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                fontWeight: '600'
              }}>
                System Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { 
                    action: '23 new user registrations',
                    time: '2 hours ago',
                    icon: 'fa-user-plus',
                    color: '#059669'
                  },
                  { 
                    action: 'Database backup completed',
                    time: '6 hours ago',
                    icon: 'fa-database',
                    color: '#7c3aed'
                  },
                  { 
                    action: 'System maintenance scheduled',
                    time: '1 day ago',
                    icon: 'fa-wrench',
                    color: '#2563eb'
                  }
                ].map((activity, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '1rem',
                      background: '#f9fafb',
                      borderRadius: '8px',
                      gap: '1rem'
                    }}
                  >
                    <i 
                      className={`fa-solid ${activity.icon}`}
                      style={{ color: activity.color, fontSize: '1.1rem' }}
                    ></i>
                    <div style={{ flex: 1 }}>
                      <p style={{ 
                        color: '#1f2937',
                        margin: 0,
                        fontWeight: '500'
                      }}>
                        {activity.action}
                      </p>
                      <p style={{ 
                        color: '#6b7280',
                        margin: 0,
                        fontSize: '0.85rem'
                      }}>
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ 
              color: '#1f2937',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              Wellness Data Management
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              View and manage user wellness assessment data and analytics.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link
                href="/wellness-check"
                style={{
                  display: 'inline-block',
                  padding: '1rem 2rem',
                  background: '#26a69a',
                  color: '#fff',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  transition: 'background 0.2s'
                }}
              >
                <i className="fa-solid fa-heart-pulse"></i> Test Assessment
              </Link>
              <button
                style={{
                  padding: '1rem 2rem',
                  background: '#6366f1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-chart-bar"></i> View Analytics
              </button>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{
            background: '#fff',
            padding: '2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #f3f4f6'
          }}>
            <h3 style={{ 
              color: '#1f2937',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              User Management
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
              Manage user accounts, permissions, and access controls.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '1rem 2rem',
                  background: '#059669',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-users"></i> View All Users
              </button>
              <button
                style={{
                  padding: '1rem 2rem',
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <i className="fa-solid fa-user-shield"></i> Admin Controls
              </button>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Message Creation Form */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                color: '#1f2937',
                fontSize: '1.5rem',
                marginBottom: '1rem',
                fontWeight: '600'
              }}>
                Create Daily Message
              </h3>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                Send push notifications to your global user base with timezone-aware scheduling.
              </p>
              
              <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Message Title */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    Message Title
                  </label>
                  <input
                    type="text"
                    value={messageForm.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Daily Wellness Reminder"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Message Content */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    Message Content
                  </label>
                  <textarea
                    value={messageForm.content}
                    onChange={(e) => handleInputChange('content', e.target.value)}
                    placeholder="Take a moment today to check in with your health and well-being..."
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '1px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '1rem',
                      outline: 'none',
                      resize: 'vertical',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Scheduling Options */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', 
                  gap: '1.5rem',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Send Date
                    </label>
                    <input
                      type="date"
                      value={messageForm.sendDate}
                      onChange={(e) => handleInputChange('sendDate', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Send Time (UTC)
                    </label>
                    <input
                      type="time"
                      value={messageForm.sendTime}
                      onChange={(e) => handleInputChange('sendTime', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: '0.5rem', 
                      color: '#374151',
                      fontWeight: '500'
                    }}>
                      Timezone Strategy
                    </label>
                    <select
                      value={messageForm.timezoneStrategy}
                      onChange={(e) => handleInputChange('timezoneStrategy', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '8px',
                        fontSize: '1rem',
                        outline: 'none',
                        background: '#fff',
                        boxSizing: 'border-box'
                      }}
                    >
                      <option value="utc">Send at UTC time</option>
                      <option value="local">Send at local time for each user</option>
                      <option value="major">Send at major timezone hours</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '0.5rem', 
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    Target Audience
                  </label>
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    {userAudiences.length > 0 ? (
                      userAudiences.map(audience => (
                        <label key={audience.audienceType} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="radio" 
                            name="targetAudience"
                            value={audience.audienceType}
                            checked={messageForm.targetAudience === audience.audienceType}
                            onChange={(e) => handleAudienceChange(e.target.value)}
                          />
                          <span style={{ color: '#374151' }}>{audience.audienceType}</span>
                        </label>
                      ))
                    ) : (
                      ['All Users', 'Active Users', 'New Users', 'Premium Users'].map(audienceType => (
                        <label key={audienceType} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <input 
                            type="radio" 
                            name="targetAudience"
                            value={audienceType}
                            checked={messageForm.targetAudience === audienceType}
                            onChange={(e) => handleAudienceChange(e.target.value)}
                          />
                          <span style={{ color: '#374151' }}>{audienceType}</span>
                        </label>
                      ))
                    )}
                  </div>
                  <div style={{ 
                    marginTop: '0.5rem', 
                    padding: '0.75rem', 
                    background: '#f3f4f6', 
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    color: '#6b7280'
                  }}>
                    <i className="fa-solid fa-info-circle" style={{ marginRight: '0.5rem', color: '#3b82f6' }}></i>
                    <strong>Recipients:</strong> The system automatically calculates the estimated number of users 
                    who will receive this message based on your audience selection:
                    <ul style={{ margin: '0.5rem 0 0 1.5rem', paddingLeft: '0' }}>
                      {userAudiences.length > 0 ? (
                        userAudiences.map(audience => (
                          <li key={audience.audienceType}>
                            <strong>{audience.audienceType}:</strong> {audience.count.toLocaleString()} users ({audience.description.toLowerCase()})
                          </li>
                        ))
                      ) : (
                        <>
                          <li><strong>All Users:</strong> {audienceLoading ? 'Loading...' : 'Loading user data...'}</li>
                          <li><strong>Active Users:</strong> {audienceLoading ? 'Loading...' : 'Loading user data...'}</li>
                          <li><strong>New Users:</strong> {audienceLoading ? 'Loading...' : 'Loading user data...'}</li>
                          <li><strong>Premium Users:</strong> {audienceLoading ? 'Loading...' : 'Loading user data...'}</li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleSaveDraft}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#6b7280',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Save as Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleScheduleMessage}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: '#059669',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    <i className="fa-solid fa-paper-plane"></i> Schedule Message
                  </button>
                </div>
              </form>
            </div>

            {/* Message Statistics */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid #f3f4f6'
            }}>
              <h3 style={{ 
                color: '#1f2937',
                fontSize: '1.25rem',
                marginBottom: '1.5rem',
                fontWeight: '600'
              }}>
                Message Statistics
              </h3>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.5rem'
              }}>
                {[
                  { label: 'Messages Sent Today', value: messageStats.sentToday.toString(), icon: 'fa-paper-plane', color: '#059669' },
                  { label: 'Total Delivery Rate', value: messageStats.deliveryRate + '%', icon: 'fa-check-circle', color: '#2563eb' },
                  { label: 'Average Open Rate', value: messageStats.openRate + '%', icon: 'fa-eye', color: '#7c3aed' },
                  { label: 'Scheduled Messages', value: messageStats.scheduled.toString(), icon: 'fa-clock', color: '#dc2626' }
                ].map((stat, index) => (
                  <div key={index} style={{ textAlign: 'center' }}>
                    <i 
                      className={`fa-solid ${stat.icon}`}
                      style={{ 
                        fontSize: '2rem', 
                        color: stat.color,
                        marginBottom: '0.5rem'
                      }}
                    ></i>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 'bold',
                      color: '#1f2937',
                      marginBottom: '0.25rem'
                    }}>
                      {stat.value}
                    </div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: '#6b7280'
                    }}>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message History */}
            <div style={{
              background: '#fff',
              padding: '2rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
              border: '1px solid #f3f4f6'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ 
                  color: '#1f2937',
                  fontSize: '1.25rem',
                  margin: 0,
                  fontWeight: '600'
                }}>
                  Message History
                </h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {['all', 'sent', 'scheduled', 'drafts'].map(filter => (
                    <button 
                      key={filter}
                      onClick={() => setHistoryFilter(filter)}
                      style={{
                        padding: '0.5rem 1rem',
                        background: historyFilter === filter ? '#059669' : '#f3f4f6',
                        color: historyFilter === filter ? '#fff' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textTransform: 'capitalize'
                      }}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>Message</th>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>Sent Time</th>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>
                        Recipients
                        <i 
                          className="fa-solid fa-question-circle" 
                          style={{ 
                            marginLeft: '0.5rem', 
                            fontSize: '0.8rem', 
                            color: '#9ca3af',
                            cursor: 'help'
                          }}
                          title="Estimated number of users who will receive this message based on the target audience"
                        ></i>
                      </th>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>Delivery Rate</th>
                      <th style={{ textAlign: 'left', padding: '1rem 0.5rem', color: '#6b7280', fontWeight: '500' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messageHistory.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ 
                          padding: '2rem', 
                          textAlign: 'center', 
                          color: '#6b7280',
                          fontStyle: 'italic'
                        }}>
                          {loading ? 'Loading messages...' : 'No messages found. Create your first message above!'}
                        </td>
                      </tr>
                    ) : messageHistory.map((message: PushMessage, index: number) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ fontWeight: '500', color: '#1f2937' }}>{message.title}</div>
                        </td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <span style={{
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.8rem',
                            fontWeight: '500',
                            background: getStatusColor(message.status) === '#059669' ? '#dcfce7' : getStatusColor(message.status) === '#dc2626' ? '#fef2f2' : '#f3f4f6',
                            color: getStatusColor(message.status)
                          }}>
                            {message.status}
                          </span>
                        </td>
                        <td style={{ padding: '1rem 0.5rem', color: '#6b7280' }}>{formatMessageTime(message)}</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#1f2937' }}>{message.recipients.toLocaleString()}</td>
                        <td style={{ padding: '1rem 0.5rem', color: '#1f2937' }}>{message.deliveryRate}</td>
                        <td style={{ padding: '1rem 0.5rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button 
                              onClick={() => handleViewMessage(message)}
                              style={{
                                padding: '0.25rem 0.5rem',
                                background: 'transparent',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                              }}
                            >
                              View
                            </button>
                            {message.status === 'Scheduled' && (
                              <button 
                                onClick={() => handleCancelMessage(message._id, message.title)}
                                style={{
                                  padding: '0.25rem 0.5rem',
                                  background: 'transparent',
                                  border: '1px solid #dc2626',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  color: '#dc2626'
                                }}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab !== 'overview' && activeTab !== 'wellness' && activeTab !== 'users' && activeTab !== 'messages' && (
          <div style={{
            background: '#fff',
            padding: '3rem 2rem',
            borderRadius: '12px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
            border: '1px solid #f3f4f6',
            textAlign: 'center'
          }}>
            <i 
              className="fa-solid fa-construction"
              style={{ fontSize: '3rem', color: '#6b7280', marginBottom: '1rem' }}
            ></i>
            <h3 style={{ 
              color: '#1f2937',
              fontSize: '1.5rem',
              marginBottom: '1rem',
              fontWeight: '600'
            }}>
              Coming Soon
            </h3>
            <p style={{ color: '#6b7280', margin: 0 }}>
              This section is under development and will be available soon.
            </p>
          </div>
        )}
      </div>

      {/* Deletion Confirmation Modal */}
      {deletingMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '1.5rem'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: '#fef2f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '1rem'
              }}>
                <i className="fa-solid fa-triangle-exclamation" style={{
                  color: '#dc2626',
                  fontSize: '1.5rem'
                }}></i>
              </div>
              <div>
                <h2 style={{
                  color: '#1f2937',
                  fontSize: '1.25rem',
                  fontWeight: 'bold',
                  margin: 0
                }}>
                  Cancel Message
                </h2>
                <p style={{
                  color: '#6b7280',
                  fontSize: '0.9rem',
                  margin: '0.25rem 0 0 0'
                }}>
                  This action cannot be undone
                </p>
              </div>
            </div>

            {/* Content */}
            <div style={{ marginBottom: '2rem' }}>
              <p style={{
                color: '#374151',
                lineHeight: '1.6',
                margin: '0 0 1rem 0'
              }}>
                Are you sure you want to cancel this scheduled message? The message will be permanently removed and cannot be recovered.
              </p>
              
              <div style={{
                padding: '1rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '1px solid #e5e7eb'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <i className="fa-solid fa-envelope" style={{
                    color: '#6b7280',
                    marginRight: '0.5rem',
                    fontSize: '0.9rem'
                  }}></i>
                  <span style={{
                    color: '#6b7280',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Message
                  </span>
                </div>
                <p style={{
                  color: '#1f2937',
                  fontWeight: '600',
                  margin: 0,
                  fontSize: '1rem'
                }}>
                  &ldquo;{deletingMessage.title}&rdquo;
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem'
            }}>
              <button
                onClick={() => setDeletingMessage(null)}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#fff',
                  color: '#374151',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                Keep Message
              </button>
              <button
                onClick={confirmCancelMessage}
                disabled={loading}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {loading && (
                  <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: '0.8rem' }}></i>
                )}
                Cancel Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Viewing Modal */}
      {viewingMessage && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '600px',
            width: '100%',
            maxHeight: '80vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1.5rem',
              paddingBottom: '1rem',
              borderBottom: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                color: '#1f2937',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                margin: 0
              }}>
                Message Details
              </h2>
              <button
                onClick={() => setViewingMessage(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#6b7280',
                  cursor: 'pointer',
                  fontSize: '1.5rem',
                  padding: '0.5rem',
                  borderRadius: '4px'
                }}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Message Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Title */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Message Title
                </label>
                <p style={{
                  color: '#1f2937',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  margin: 0,
                  padding: '0.75rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  {viewingMessage.title}
                </p>
              </div>

              {/* Content */}
              <div>
                <label style={{
                  display: 'block',
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Message Content
                </label>
                <p style={{
                  color: '#1f2937',
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  lineHeight: '1.6',
                  minHeight: '80px'
                }}>
                  {viewingMessage.content}
                </p>
              </div>

              {/* Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem'
              }}>
                {/* Status */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Status
                  </label>
                  <span style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    background: viewingMessage.status === 'Delivered' ? '#dcfce7' : 
                               viewingMessage.status === 'Scheduled' ? '#fef3cd' : '#fef2f2',
                    color: viewingMessage.status === 'Delivered' ? '#059669' : 
                           viewingMessage.status === 'Scheduled' ? '#d97706' : '#dc2626'
                  }}>
                    {viewingMessage.status}
                  </span>
                </div>

                {/* Recipients */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Recipients
                  </label>
                  <p style={{
                    color: '#1f2937',
                    fontWeight: '600',
                    margin: 0
                  }}>
                    {viewingMessage.recipients?.toLocaleString()} users
                  </p>
                </div>

                {/* Target Audience */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Target Audience
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {viewingMessage.targetAudience?.map((audience, index) => (
                      <span key={index} style={{
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: '500'
                      }}>
                        {audience}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Send Date & Time */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Scheduled For
                  </label>
                  <p style={{
                    color: '#1f2937',
                    margin: 0
                  }}>
                    {viewingMessage.sendDate} at {viewingMessage.sendTime}
                  </p>
                </div>

                {/* Delivery Rate */}
                {viewingMessage.status === 'Delivered' && (
                  <div>
                    <label style={{
                      display: 'block',
                      color: '#374151',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      fontSize: '0.8rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Delivery Rate
                    </label>
                    <p style={{
                      color: '#059669',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      {viewingMessage.deliveryRate}
                    </p>
                  </div>
                )}

                {/* Created Date */}
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontWeight: '500',
                    marginBottom: '0.5rem',
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Created
                  </label>
                  <p style={{
                    color: '#6b7280',
                    margin: 0,
                    fontSize: '0.9rem'
                  }}>
                    {new Date(viewingMessage.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>


            </div>

            {/* Footer Actions */}
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '1rem',
              marginTop: '2rem',
              paddingTop: '1.5rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <button
                onClick={() => setViewingMessage(null)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '0.9rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
              {viewingMessage.status === 'Scheduled' && (
                <button
                  onClick={() => {
                    setViewingMessage(null);
                    handleCancelMessage(viewingMessage._id, viewingMessage.title);
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Cancel Message
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}