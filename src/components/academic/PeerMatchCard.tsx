'use client';

import React, { useState } from 'react';
import { UserCheck, Award, MessageCircle, CheckCircle2 } from 'lucide-react';
import { PeerMatchGraph } from '@/types/academic';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function PeerMatchCard({ data }: { data: PeerMatchGraph }) {
  const [connectedIds, setConnectedIds] = useState<string[]>([]);

  const handleConnect = (id: string) => {
    setConnectedIds([...connectedIds, id]);
  };

  return (
    <Card className="border-[#E5E7EB] bg-white shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold text-[#1F2937] flex items-center gap-2">
            <span className="font-mono text-[#FF3D4A]">{data.courseCode}</span>: {data.courseTitle}
          </CardTitle>
          <Badge variant="red">{data.peers.length} Peers | {data.seniorMentors.length} Senior Mentors</Badge>
        </div>
        <CardDescription className="text-xs text-[#6B7280]">
          Cross-referenced study network computed from active AFIT course registrations.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Senior Mentors Section */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FF3D4A] flex items-center gap-1.5 mb-3">
            <Award className="w-4 h-4 text-[#FF3D4A]" /> SENIOR MENTORS (Earned A or B in {data.courseCode})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.seniorMentors.map((mentor) => {
              const isConnected = connectedIds.includes(mentor.id);
              return (
                <div key={mentor.id} className="p-4 rounded-2xl bg-[#FFF5F5]/60 border border-[#E5E7EB] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF3D4A] text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {mentor.fullName.split(' ')[1]?.[0] || 'M'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1F2937]">{mentor.fullName}</div>
                      <div className="text-[11px] text-[#6B7280]">{mentor.department} ({mentor.level}L)</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="gold" className="text-[10px]">
                          Earned Grade '{mentor.gradeEarned}'
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isConnected ? 'success' : 'primary'}
                    onClick={() => handleConnect(mentor.id)}
                    className="text-xs gap-1 rounded-xl"
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Connected
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" /> Connect
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peers Section */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#FF3D4A] flex items-center gap-1.5 mb-3">
            <UserCheck className="w-4 h-4 text-[#FF3D4A]" /> ACTIVE CLASS PEERS (Registered for {data.courseCode})
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {data.peers.map((peer) => {
              const isConnected = connectedIds.includes(peer.id);
              return (
                <div key={peer.id} className="p-4 rounded-2xl bg-white border border-[#E5E7EB] flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FFF0F1] text-[#FF3D4A] font-bold flex items-center justify-center text-sm border border-[#FF3D4A]/20">
                      {peer.fullName.split(' ')[1]?.[0] || 'P'}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#1F2937]">{peer.fullName}</div>
                      <div className="text-[11px] text-[#6B7280]">{peer.department} ({peer.level}L)</div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isConnected ? 'success' : 'secondary'}
                    onClick={() => handleConnect(peer.id)}
                    className="text-xs gap-1 rounded-xl"
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Joined Group
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-3.5 h-3.5" /> Join Study Pair
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
