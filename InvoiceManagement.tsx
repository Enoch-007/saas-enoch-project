import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { FileText, CheckCircle, XCircle, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  mentor: {
    full_name: string;
    email: string;
  };
  amount_credits: number;
  amount_currency: number;
  status: string;
  payment_method: string;
  payment_details: any;
  created_at: string;
  admin_notes: string;
}

export function InvoiceManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingInvoices();
  }, []);

  const fetchPendingInvoices = async () => {
    try {
      const { data, error } = await supabase
        .from('mentor_invoices')
        .select(`
          *,
          mentor:profiles!mentor_id (
            full_name,
            email
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setInvoices(data || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      setError('Failed to load pending invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessInvoice = async (invoiceId: string, status: string, notes?: string) => {
    setProcessing(invoiceId);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase.rpc('process_mentor_invoice', {
        p_invoice_id: invoiceId,
        p_status: status,
        p_admin_notes: notes
      });

      if (error) throw error;

      setSuccess(`Invoice ${status} successfully`);
      fetchPendingInvoices();
    } catch (error) {
      console.error('Error processing invoice:', error);
      setError('Failed to process invoice');
    } finally {
      setProcessing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Invoice Management</h1>
        <p className="text-gray-600">Review and process mentor payment requests</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex items-center">
            <FileText className="h-6 w-6 text-indigo-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Pending Invoices</h2>
          </div>
        </div>

        <div className="divide-y">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {invoice.mentor.full_name}
                  </h3>
                  <p className="text-sm text-gray-500">{invoice.mentor.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    ${invoice.amount_currency.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {invoice.amount_credits} credits
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-medium text-gray-900 mb-2">Payment Details</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dl className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm text-gray-500">Account Name</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {invoice.payment_details.accountName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Account Number</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {invoice.payment_details.accountNumber}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">Bank Name</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {invoice.payment_details.bankName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm text-gray-500">SWIFT Code</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {invoice.payment_details.swiftCode}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="text-sm text-gray-500 mb-6">
                Submitted: {format(new Date(invoice.created_at), 'MMM d, yyyy')}
              </div>

              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => handleProcessInvoice(invoice.id, 'rejected', 'Payment details invalid')}
                  disabled={!!processing}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 flex items-center disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5 mr-2" />
                  Reject
                </button>
                <button
                  onClick={() => handleProcessInvoice(invoice.id, 'approved')}
                  disabled={!!processing}
                  className="px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-50 flex items-center disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Approve
                </button>
                <button
                  onClick={() => handleProcessInvoice(invoice.id, 'paid')}
                  disabled={!!processing}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50"
                >
                  <DollarSign className="h-5 w-5 mr-2" />
                  Mark as Paid
                </button>
              </div>
            </div>
          ))}

          {invoices.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No pending invoices to review
            </div>
          )}
        </div>
      </div>
    </div>
  );
}