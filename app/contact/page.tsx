// app/contact/page.tsx
"use client";

import { useState } from "react";
import { submitContactMessage } from "@/lib/db/content";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Mail, MapPin, MessageSquare, Phone, Send, CheckCircle } from "lucide-react";
import { useToast } from "@/components/shared/Toast";

export default function ContactPage() {
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      toast("Please fill in all fields.", "error");
      return;
    }

    try {
      setLoading(true);
      await submitContactMessage({
        name,
        email,
        subject,
        message
      });
      
      setSuccess(true);
      toast("Message submitted successfully!", "success");
      // Reset
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      console.error(err);
      toast("Failed to submit inquiry. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream py-16 px-4 sm:px-6 lg:px-8 font-sans text-brand-charcoal">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <h1 className="text-4xl font-display font-medium text-brand-plum">
            Get in Touch
          </h1>
          <p className="text-sm font-body text-brand-charcoal/60 mt-2">
            Have questions about sizes or deliveries? Send us a message and our support team will get back to you.
          </p>
        </div>

        {/* Contact Info and Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Details Card */}
          <div className="lg:col-span-4 bg-white p-8 rounded-card border border-brand-sand/55 shadow-sm space-y-8 flex flex-col justify-between min-h-[460px]">
            <div className="space-y-6">
              <h2 className="text-2xl font-display font-medium text-brand-plum">
                Contact Details
              </h2>
              <p className="text-xs font-body text-brand-charcoal/70 leading-relaxed">
                Prefer direct support channels? Drop us an email or reach out on our active customer WhatsApp stream.
              </p>

              <div className="space-y-4 text-xs font-body text-brand-charcoal/80">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-brand-mauve shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-brand-plum font-display">Coordinates</strong>
                    <span className="mt-0.5 text-brand-charcoal">Colombo, Sri Lanka</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-brand-mauve shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-brand-plum font-display">Customer WhatsApp</strong>
                    <a href="https://wa.me/94XXXXXXXXX" target="_blank" rel="noopener noreferrer" className="hover:text-brand-mauve text-brand-plum transition-colors underline mt-0.5 block font-medium">
                      Message us on WhatsApp
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-brand-mauve shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-brand-plum font-display">Email Address</strong>
                    <a href="mailto:hello@monascloset.lk" className="hover:text-brand-mauve text-brand-plum transition-colors underline mt-0.5 block font-medium">
                      hello@monascloset.lk
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-brand-sand/30 text-xs text-brand-charcoal/50 font-body">
              Response Time: Within 12-24 hours.
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="lg:col-span-8 bg-white p-8 rounded-card border border-brand-sand/55 shadow-sm">
            {success ? (
              <div className="text-center py-16 space-y-4 max-w-sm mx-auto">
                <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="font-display font-medium text-lg text-brand-plum">Inquiry Submitted</h3>
                <p className="text-xs text-zinc-500 font-body leading-relaxed">
                  Thank you for contacting us. Your message has been saved in our database. Our agents will read it and email you back soon.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="text-xs text-brand-mauve hover:text-brand-plum underline font-body font-semibold block mx-auto pt-2"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex flex-col gap-1.5 border-b border-zinc-100 pb-3 mb-2">
                  <h3 className="text-md font-bold font-display text-brand-plum flex items-center gap-1.5">
                    <MessageSquare className="w-4.5 h-4.5 text-zinc-400" /> Send a Message
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Your Name"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dilini Rajapaksa"
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. dilini@example.com"
                  />
                </div>

                <Input
                  label="Subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Inquiry regarding dress sizes"
                />

                <div className="flex flex-col gap-1.5 text-zinc-700">
                  <label className="text-xs font-semibold font-body">Message</label>
                  <textarea
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your details here..."
                    className="w-full px-3 py-2.5 border border-brand-sand rounded-card text-sm focus:outline-none focus:border-brand-mauve font-body"
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  loading={loading}
                  className="bg-brand-mauve text-white hover:bg-brand-plum px-8 py-3 rounded-card text-xs flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" /> Submit Inquiry
                </Button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
