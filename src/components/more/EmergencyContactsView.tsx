import React, { useState } from 'react';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Plus,
  Trash2,
  Edit2,
  Shield,
  Heart,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ImportantContact } from '../../types';

export const EmergencyContactsView: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact, setMoreSubView, showToast } =
    useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ImportantContact | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);

  const openNewContactModal = () => {
    setEditingContact(null);
    setName('');
    setRelation('Close Friend');
    setPhone('');
    setNotes('');
    setIsEmergency(false);
    setIsModalOpen(true);
  };

  const openEditModal = (contact: ImportantContact) => {
    setEditingContact(contact);
    setName(contact.name);
    setRelation(contact.relation);
    setPhone(contact.phone);
    setNotes(contact.notes || '');
    setIsEmergency(contact.isEmergency || false);
    setIsModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingContact) {
      updateContact(editingContact.id, {
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        isEmergency,
      });
      showToast('Contact updated 📞', '📞');
    } else {
      addContact({
        name: name.trim(),
        relation: relation.trim(),
        phone: phone.trim(),
        notes: notes.trim() || undefined,
        isEmergency,
      });
      showToast('New trusted contact added 🌸', '🌸');
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto px-4 sm:px-6 pt-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMoreSubView(null)}
            className="p-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-stone-100">
              Important Contacts & Safety
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Quick access to loved ones, close friends, doctors, and emergency numbers.
            </p>
          </div>
        </div>

        <button
          onClick={openNewContactModal}
          className="py-2.5 px-4 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Safety Banner */}
      <div className="rounded-3xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 p-4 sm:p-5 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0">
          <Shield className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1">
          <h3 className="font-semibold text-rose-900 dark:text-rose-200">
            Peace of Mind at Your Fingertips
          </h3>
          <p className="text-rose-700/80 dark:text-rose-300/80 leading-relaxed">
            Keep your closest support network here for quick one-tap calls or messages whenever you need reassurance, help, or a gentle check-in.
          </p>
        </div>
      </div>

      {/* Contacts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
              contact.isEmergency
                ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                : 'bg-white dark:bg-stone-900 border-stone-200/80 dark:border-stone-800'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-sm text-stone-900 dark:text-stone-100">
                      {contact.name}
                    </h3>
                    {contact.isEmergency && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold uppercase tracking-wider">
                        SOS
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 block mt-0.5">
                    {contact.relation}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(contact)}
                    className="p-1 text-stone-400 hover:text-stone-600"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-1 text-stone-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="font-mono text-xs font-semibold text-stone-700 dark:text-stone-300 mt-2">
                {contact.phone}
              </div>

              {contact.notes && (
                <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 italic">
                  &ldquo;{contact.notes}&rdquo;
                </p>
              )}
            </div>

            {/* Actions: Call & SMS */}
            <div className="flex items-center gap-2 pt-4 mt-3 border-t border-stone-100 dark:border-stone-800">
              <a
                href={`tel:${contact.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
              >
                <Phone className="w-3.5 h-3.5" /> Call
              </a>

              <a
                href={`sms:${contact.phone}`}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" /> Text
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
          <div className="bg-stone-50 dark:bg-stone-900 w-full max-w-md rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 p-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800 mb-4">
              <h3 className="font-serif text-lg font-semibold text-stone-900 dark:text-stone-100">
                {editingContact ? 'Edit Contact' : 'New Important Contact'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-stone-400 hover:text-stone-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mom, Alex, Dr. Miller..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Partner, Parent, Best Friend..."
                    value={relation}
                    onChange={(e) => setRelation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +1 555-0199"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Notes (e.g. Lives nearby, emergency standby)
                </label>
                <input
                  type="text"
                  placeholder="Optional brief notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-stone-700 dark:text-stone-300">
                  <input
                    type="checkbox"
                    checked={isEmergency}
                    onChange={(e) => setIsEmergency(e.target.checked)}
                    className="accent-rose-500 rounded-sm"
                  />
                  <span>Mark as Priority Emergency Contact</span>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-medium hover:bg-stone-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-medium shadow-xs"
                >
                  {editingContact ? 'Save Changes' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
