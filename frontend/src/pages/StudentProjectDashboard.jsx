import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Bot, FileText, GraduationCap, Loader2, Lock, PackageCheck, Send } from 'lucide-react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { apiFetch } from '../lib/api'

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem('studentProjectToken') || ''}`,
})

export default function StudentProjectDashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({ student: null, orders: [], internshipUpdates: [] })
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [asking, setAsking] = useState(false)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      const res = await apiFetch('/api/ai-project-delivery/student/dashboard', { headers: authHeaders() })
      setData(res.data || { student: null, orders: [], internshipUpdates: [] })
      setSelectedOrderId(res.data?.orders?.[0]?.id || '')
    } catch (error) {
      toast.error('Please login again')
      navigate('/student/project-login')
    } finally {
      setLoading(false)
    }
  }

  const askBot = async (e) => {
    e.preventDefault()
    if (!selectedOrderId || !question.trim()) return
    setAsking(true)
    try {
      const res = await apiFetch('/api/ai-project-delivery/student/chatbot/ask', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ orderId: selectedOrderId, message: question }),
      })
      setAnswer(res.data.answer)
    } catch (error) {
      toast.error(error.message || 'Chatbot failed')
    } finally {
      setAsking(false)
    }
  }

  if (loading) {
    return <main className="min-h-screen pt-28 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-400" /></main>
  }

  const selectedOrder = data.orders.find((o) => o.id === selectedOrderId) || data.orders[0]
  const internshipOrders = data.orders.filter((o) => o.orderType === 'internship')

  return (
    <>
      <Helmet><title>My Project Dashboard | Digital Wave</title></Helmet>
      <main className="min-h-screen pt-28 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold gradient-text">Welcome, {data.student?.name || 'Student'}</h1>
            <p className="text-gray-400 mt-2">Track your paid project/internship, assets, updates and restricted project assistant.</p>
          </div>

          {data.orders.length === 0 ? (
            <div className="glass rounded-3xl p-10 text-center border border-white/10">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-white">No active paid order found</h2>
              <p className="text-gray-400">Orders appear here after payment success.</p>
            </div>
          ) : (
            <div className="grid lg:grid-cols-3 gap-6">
              <section className="lg:col-span-2 space-y-5">
                {data.orders.map((order) => (
                  <button key={order.id} onClick={() => setSelectedOrderId(order.id)} className={`w-full text-left glass rounded-3xl p-6 border transition ${selectedOrderId === order.id ? 'border-blue-400' : 'border-white/10'}`}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="text-xs text-blue-300">{order.orderNumber}</p>
                        <h2 className="text-2xl font-semibold text-white">{order.title}</h2>
                        <p className="text-gray-400">{order.category || order.techStack}</p>
                        <span className="inline-flex mt-3 px-3 py-1 rounded-full bg-white/10 text-sm text-gray-200">
                          {order.orderType === 'internship' ? 'Internship + Project' : 'Only Project'}
                        </span>
                      </div>
                      {['delivery_unlocked', 'delivered'].includes(order.status) ? <PackageCheck className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-yellow-400" />}
                    </div>
                    <div className="grid sm:grid-cols-3 gap-3 mt-5 text-sm">
                      <div className="bg-white/5 rounded-2xl p-3"><p className="text-gray-400">Status</p><p className="text-white">{order.progressLabel}</p></div>
                      <div className="bg-white/5 rounded-2xl p-3"><p className="text-gray-400">Payment</p><p className="text-white">{order.paymentStatus}</p></div>
                      <div className="bg-white/5 rounded-2xl p-3"><p className="text-gray-400">Deadline</p><p className="text-white">{order.deadline || 'Not set'}</p></div>
                    </div>
                  </button>
                ))}

                {selectedOrder && (
                  <div className="glass rounded-3xl p-6 border border-white/10">
                    <h2 className="text-2xl font-semibold text-white mb-4">Selected Order Insights</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="bg-white/5 rounded-3xl p-4">
                        <p className="text-xs text-gray-400">Order Number</p>
                        <p className="text-sm text-white mt-1">{selectedOrder.orderNumber}</p>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-4">
                        <p className="text-xs text-gray-400">Current Status</p>
                        <p className="text-sm text-white mt-1">{selectedOrder.progressLabel || selectedOrder.status}</p>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-4">
                        <p className="text-xs text-gray-400">Tech Stack</p>
                        <p className="text-sm text-white mt-1">{selectedOrder.techStack || selectedOrder.category || '-'}</p>
                      </div>
                      <div className="bg-white/5 rounded-3xl p-4">
                        <p className="text-xs text-gray-400">Deadline</p>
                        <p className="text-sm text-white mt-1">{selectedOrder.deadline || 'Flexible'}</p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">Project Requirements</h3>
                        <p className="text-gray-400 mt-2">{selectedOrder.requirements?.custom_notes || 'No additional notes have been provided yet.'}</p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">AI Delivery Blueprint</h3>
                        {selectedOrder.aiProject?.aiOutput ? (
                          <div className="grid gap-4 mt-3">
                            {selectedOrder.aiProject.aiOutput.projectOverview && (
                              <div className="bg-white/5 rounded-3xl p-4">
                                <h4 className="text-sm font-semibold text-white">Overview</h4>
                                <p className="text-gray-300 text-sm mt-2">{selectedOrder.aiProject.aiOutput.projectOverview}</p>
                              </div>
                            )}
                            {selectedOrder.aiProject.aiOutput.projectScope && (
                              <div className="bg-white/5 rounded-3xl p-4">
                                <h4 className="text-sm font-semibold text-white">Scope</h4>
                                <p className="text-gray-300 text-sm mt-2">{selectedOrder.aiProject.aiOutput.projectScope}</p>
                              </div>
                            )}
                            {selectedOrder.aiProject.aiOutput.deploymentGuide && (
                              <div className="bg-white/5 rounded-3xl p-4">
                                <h4 className="text-sm font-semibold text-white">Deployment Guide</h4>
                                <p className="text-gray-300 text-sm mt-2">{selectedOrder.aiProject.aiOutput.deploymentGuide}</p>
                              </div>
                            )}
                            {selectedOrder.aiProject.aiOutput.vivaQuestions && (
                              <div className="bg-white/5 rounded-3xl p-4">
                                <h4 className="text-sm font-semibold text-white">Viva Questions</h4>
                                <p className="text-gray-300 text-sm mt-2">{selectedOrder.aiProject.aiOutput.vivaQuestions}</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-gray-400 mt-2">AI output is still pending. Your admin team will generate or review it soon.</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-white">Final Delivery</h3>
                        {['delivery_unlocked', 'delivered'].includes(selectedOrder.status) ? (
                          <div className="mt-3 space-y-3">
                            {selectedOrder.deliveryAssets?.githubRepoUrl && (
                              <a className="block text-blue-300 hover:underline" href={selectedOrder.deliveryAssets.githubRepoUrl} target="_blank" rel="noreferrer">View GitHub Repository</a>
                            )}
                            {selectedOrder.deliveryAssets?.zipFileUrl && (
                              <a className="block text-blue-300 hover:underline" href={selectedOrder.deliveryAssets.zipFileUrl} target="_blank" rel="noreferrer">Download Project Archive</a>
                            )}
                            {selectedOrder.deliveryAssets?.documentationUrl && (
                              <a className="block text-blue-300 hover:underline" href={selectedOrder.deliveryAssets.documentationUrl} target="_blank" rel="noreferrer">Open Documentation</a>
                            )}
                            {selectedOrder.deliveryAssets?.pptUrl && (
                              <a className="block text-blue-300 hover:underline" href={selectedOrder.deliveryAssets.pptUrl} target="_blank" rel="noreferrer">Download Presentation</a>
                            )}
                            {!selectedOrder.deliveryAssets && <p className="text-gray-400">Delivery content is being prepared and will appear after final approval.</p>}
                          </div>
                        ) : (
                          <p className="text-gray-400 mt-2">Final assets stay locked until admin quality approval is complete.</p>
                        )}
                      </div>

                      {selectedOrder.messages?.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-white">Notes from Admin</h3>
                          <div className="mt-3 space-y-3">
                            {selectedOrder.messages.map((message) => (
                              <div key={message.id} className="bg-white/5 rounded-3xl p-4">
                                <p className="text-sm text-gray-300">{message.message}</p>
                                <p className="text-xs text-gray-500 mt-2">From: {message.senderName || 'Admin'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {internshipOrders.length > 0 && (
                  <div className="glass rounded-3xl p-6 border border-white/10">
                    <div className="flex items-center gap-2 mb-4"><GraduationCap className="w-6 h-6 text-purple-300" /><h2 className="text-xl font-semibold">Internship Updates</h2></div>
                    <div className="space-y-3">
                      {data.internshipUpdates.length === 0 ? <p className="text-gray-400">No internship update yet.</p> : data.internshipUpdates.map((u) => (
                        <div key={u.id} className="bg-white/5 rounded-2xl p-4"><p className="text-white font-medium">{u.title}</p><p className="text-gray-400 text-sm mt-1">{u.message}</p></div>
                      ))}
                    </div>
                  </div>
                )}
              </section>

              <aside className="glass rounded-3xl p-6 border border-white/10 h-fit sticky top-28">
                <div className="flex items-center gap-2 mb-4"><Bot className="w-6 h-6 text-blue-300" /><h2 className="text-xl font-semibold">Project Assistant</h2></div>
                <p className="text-sm text-gray-400 mb-4">This chatbot is restricted to your selected project/internship only.</p>
                <form onSubmit={askBot} className="space-y-3">
                  <textarea className="input-field min-h-[100px]" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Ask about your project status, scope, docs, viva, deployment..." />
                  <button disabled={asking} className="btn-primary w-full flex items-center justify-center gap-2">
                    {asking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />} Ask
                  </button>
                </form>
                {answer && <div className="mt-4 bg-white/5 rounded-2xl p-4 text-sm text-gray-200">{answer}</div>}
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
