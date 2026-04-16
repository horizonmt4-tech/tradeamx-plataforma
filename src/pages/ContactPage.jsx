import React, { useState, useEffect } from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from '@/lib/supabaseClient';
import { Mail, Clock, MapPin, Send, Loader2 } from 'lucide-react';

const ContactPage = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            subject: formData.subject, 
            message: formData.message 
          }
        ]);

      if (error) throw error;

      toast({
        title: "Message Sent!",
        description: "We'll get back to you as soon as possible.",
        className: "bg-green-600 text-white border-none"
      });
      setFormData({ name: '', email: '', subject: '', message: '' });

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex flex-col font-sans">
      <Helmet>
        <title>Contact Us | Tradea</title>
        <meta name="description" content="Get in touch with Tradea support team." />
      </Helmet>
      <Navbar />
      <main className="flex-grow pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          <div className="space-y-8">
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">Contact Us</h1>
                <p className="text-gray-400 text-lg">
                    Have questions? We're here to help. Reach out to our team and we'll respond as soon as we can.
                </p>
            </div>

            <div className="bg-slate-900/50 p-8 rounded-xl border border-slate-800 space-y-6">
                <div className="flex items-start gap-4">
                    <div className="bg-blue-500/10 p-3 rounded-lg">
                        <Mail className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Email</h3>
                        <p className="text-gray-400 text-sm mb-1">Our friendly team is here to help.</p>
                        <a href="mailto:support@tradeamx.com" className="text-[#667eea] hover:underline font-medium">support@tradeamx.com</a>
                    </div>
                </div>

                <div className="flex items-start gap-4">
                     <div className="bg-blue-500/10 p-3 rounded-lg">
                        <Clock className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Business Hours</h3>
                        <p className="text-gray-400 text-sm">Mon - Fri: 9:00 AM - 6:00 PM EST</p>
                        <p className="text-gray-400 text-sm">Weekend Support: Limited Availability</p>
                    </div>
                </div>

                 <div className="flex items-start gap-4">
                     <div className="bg-blue-500/10 p-3 rounded-lg">
                        <MapPin className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-white font-semibold text-lg mb-1">Location</h3>
                        <p className="text-gray-400 text-sm">Global Operations</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Your Name</Label>
                        <Input 
                            id="name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required 
                            placeholder="John Doe"
                            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email"
                            name="email" 
                            value={formData.email} 
                            onChange={handleChange} 
                            required 
                            placeholder="john@example.com"
                            className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                        />
                    </div>
                </div>
                
                <div className="space-y-2">
                    <Label htmlFor="subject" className="text-gray-300">Subject</Label>
                    <Input 
                        id="subject" 
                        name="subject" 
                        value={formData.subject} 
                        onChange={handleChange} 
                        required 
                        placeholder="How can we help?"
                        className="bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-gray-300">Message</Label>
                    <Textarea 
                        id="message" 
                        name="message" 
                        value={formData.message} 
                        onChange={handleChange} 
                        required 
                        placeholder="Tell us more about your inquiry..."
                        className="min-h-[150px] bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
                    />
                </div>

                <Button 
                    type="submit" 
                    className="w-full bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold h-12"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-4 w-4" /> Send Message
                        </>
                    )}
                </Button>
            </form>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;