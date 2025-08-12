import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import BillCard from '../../components/BillCard';
import api from '../../services/api';
import BackButton from '../../components/BackButton';
import GroupChat from './GroupChat';
import { useAuth } from '../../hooks/useAuth';
import { useSettlements } from '../../context/SettlementsContext'; // <-- Import the context hook
import Modal from '../../components/Modal';

// Icon Components
const PersonAddIcon = () => ( <svg xmlns="http://www.w.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="17" y1="11" x2="23" y2="11"></line></svg> );
const GuestIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg> );
const DeleteIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg> );
const RemoveIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>);

const GroupDetail = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { refetchSettlements } = useSettlements(); // Get the refetch function
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState(null);

    const fetchGroupDetails = useCallback(async () => {
        try {
            const { data } = await api.get(`/groups/${groupId}`);
            setGroup(data);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to fetch group details.");
        } finally {
            setLoading(false);
        }
    }, [groupId]);

    useEffect(() => {
        fetchGroupDetails();
    }, [fetchGroupDetails]);

    const handleDeleteBill = async (billId) => {
        if (window.confirm("Are you sure you want to delete this bill?")) {
            try {
                await api.delete(`/bills/${billId}`);
                fetchGroupDetails();
            } catch (err) { alert("Failed to delete bill."); }
        }
    };

    const handleDeleteGroup = async () => {
        if (window.confirm("DELETE GROUP?\n\nThis will delete the group and ALL of its bills permanently. This action cannot be undone.")) {
            try {
                await api.delete(`/groups/${groupId}`);
                refetchSettlements(); // Trigger a global state update
                navigate('/groups');
            } catch (err) {
                alert("Failed to delete group.");
            }
        }
    };

    const openRemoveModal = (member) => {
        setMemberToRemove(member);
        setIsModalOpen(true);
    };

    const handleConfirmRemove = async (resolution) => {
        if (!memberToRemove) return;
        try {
            await api.post(`/groups/${groupId}/members/${memberToRemove.id}`, { resolution });
            fetchGroupDetails();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to remove member.");
        } finally {
            setIsModalOpen(false);
            setMemberToRemove(null);
        }
    };

    if (loading) return <div className="text-center py-10">Loading group details...</div>;
    if (error) return <div className="text-center py-10 text-red-500 card max-w-md mx-auto">{error}</div>;
    if (!group) return <div className="text-center py-10">Group not found.</div>;

    const creatorId = group.createdBy?._id || group.createdBy;
    const isCreator = user?.id === creatorId;

    return (
        <>
            <div>
                <BackButton />
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{group.name}</h1>
                    <div className="flex items-center gap-2">
                        <Link to={`/groups/${group._id}/add-bill`} className="btn-primary">Add a Bill</Link>
                        {isCreator && (
                            <button onClick={handleDeleteGroup} title="Delete Group" className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full">
                                <DeleteIcon />
                            </button>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Bills</h2>
                            <div className="space-y-4">
                                {group.bills?.length > 0 ? (
                                    group.bills.map(bill => <BillCard key={bill._id} bill={bill} onDelete={handleDeleteBill} />)
                                ) : (
                                    <div className="card text-center"><p className="text-gray-500 dark:text-gray-400">No bills added yet.</p></div>
                                )}
                            </div>
                        </div>
                        <div><GroupChat groupId={groupId} /></div>
                    </div>
                    <div className="lg:col-span-1">
                        <div className="card">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Participants</h2>
                                {isCreator && (
                                    <div className="flex gap-1">
                                       <Link to={`/groups/${group._id}/add-member`} title="Add Registered Member" className="btn-icon"><PersonAddIcon /></Link>
                                       <Link to={`/groups/${group._id}/add-virtual-member`} title="Add Guest" className="btn-icon"><GuestIcon /></Link>
                                    </div>
                                )}
                            </div>
                            <ul className="space-y-3">
                                {group.members?.map(member => (
                                    <li key={member._id} className="flex items-center justify-between gap-3 group">
                                        <div className="flex items-center gap-3">
                                            <img src={member.avatar || `https://ui-avatars.com/api/?name=${member.username}`} alt={member.username} className="h-10 w-10 rounded-full object-cover"/>
                                            <span className="font-medium">{member.username}</span>
                                            {member._id === creatorId && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>}
                                        </div>
                                        {isCreator && user.id !== member._id && (
                                            <button onClick={() => openRemoveModal({id: member._id, name: member.username})} title="Remove Member" className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><RemoveIcon /></button>
                                        )}
                                    </li>
                                ))}
                                {group.virtualMembers?.map(member => (
                                    <li key={member._id} className="flex items-center justify-between gap-3 group">
                                         <div className="flex items-center gap-3">
                                            <img src={`https://ui-avatars.com/api/?name=${member.name}`} alt={member.name} className="h-10 w-10 rounded-full object-cover"/>
                                            <div><span className="font-medium">{member.name}</span><span className="block text-xs text-gray-400">Guest</span></div>
                                         </div>
                                         {isCreator && (<button onClick={() => openRemoveModal({id: member._id, name: member.name})} title="Remove Guest" className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"><RemoveIcon /></button>)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Remove ${memberToRemove?.name}?`}>
                <div className="space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400">This member is part of one or more bills. How would you like to handle their share of the costs?</p>
                    <div className="flex flex-col gap-4 pt-4">
                        <button onClick={() => handleConfirmRemove('resplit')} className="w-full text-left p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Re-split Share Equally</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Distribute {memberToRemove?.name}'s debt among the remaining participants of each bill.</p>
                        </button>
                        <button onClick={() => handleConfirmRemove('absorb')} className="w-full text-left p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <p className="font-semibold text-gray-800 dark:text-gray-200">Absorb Share</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Forgive {memberToRemove?.name}'s debt. The person who originally paid for each bill will absorb the cost.</p>
                        </button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default GroupDetail;