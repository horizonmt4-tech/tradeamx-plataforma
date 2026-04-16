import React from 'react';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, MessageCircle, Phone } from 'lucide-react';

const SupportPage = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-white mb-4">Contact Support</h1>
                <p className="text-gray-400 text-lg">We are here to help you 24/7. Choose your preferred method of contact.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="bg-slate-800 border-slate-700 text-center hover:bg-slate-800/80 transition-colors">
                    <CardContent className="pt-6">
                        <Mail className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Email Us</h3>
                        <p className="text-gray-400 text-sm">support@tradea.com</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 text-center hover:bg-slate-800/80 transition-colors">
                    <CardContent className="pt-6">
                        <MessageCircle className="w-10 h-10 text-green-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Live Chat</h3>
                        <p className="text-gray-400 text-sm">Available 24/5</p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-800 border-slate-700 text-center hover:bg-slate-800/80 transition-colors">
                    <CardContent className="pt-6">
                        <Phone className="w-10 h-10 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-white font-semibold mb-2">Phone</h3>
                        <p className="text-gray-400 text-sm">+1 (555) 123-4567</p>
                    </CardContent>
                </Card>
            </div>

            <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                    <CardTitle className="text-white">Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-gray-200">Name</Label>
                                <Input id="name" placeholder="Your name" className="bg-slate-900 border-slate-600 text-white" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-200">Email</Label>
                                <Input id="email" type="email" placeholder="Your email" className="bg-slate-900 border-slate-600 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="subject" className="text-gray-200">Subject</Label>
                            <Input id="subject" placeholder="How can we help?" className="bg-slate-900 border-slate-600 text-white" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="message" className="text-gray-200">Message</Label>
                            <textarea 
                                id="message" 
                                className="w-full h-32 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50" 
                                placeholder="Describe your issue..."
                            />
                        </div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Send Message</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SupportPage;