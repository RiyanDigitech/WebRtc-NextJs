'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Space, Typography, Avatar } from 'antd';
import {
    VideoCameraOutlined,
    AudioOutlined,
    AudioMutedOutlined,
    PhoneOutlined,
    CloseOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useSocket } from './SocketProvider';

const { Title, Text } = Typography;

interface VideoCallProps {
    currentUserId: string;
    userName: string;
}

export const VideoCall: React.FC<VideoCallProps> = ({ currentUserId, userName }) => {
    const { socket } = useSocket();
    const [isCalling, setIsCalling] = useState(false);
    const [incomingCall, setIncomingCall] = useState<{ from: string; offer: any; name: string } | null>(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
    const [localStream, setLocalStream] = useState<MediaStream | null>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [targetUserId, setTargetUserId] = useState<string | null>(null);

    const pc = useRef<RTCPeerConnection | null>(null);
    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);

    const configuration = {
        iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
        ],
    };

    const cleanup = useCallback(() => {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        if (pc.current) {
            pc.current.close();
            pc.current = null;
        }
        setLocalStream(null);
        setRemoteStream(null);
        setCallAccepted(false);
        setIsCalling(false);
        setIncomingCall(null);
        setTargetUserId(null);
    }, [localStream]);

    const initPeerConnection = useCallback(() => {
        pc.current = new RTCPeerConnection(configuration);

        pc.current.onicecandidate = (event) => {
            if (event.candidate && targetUserId && socket) {
                socket.emit('ice-candidate', {
                    to: targetUserId,
                    candidate: event.candidate,
                });
            }
        };

        pc.current.ontrack = (event) => {
            setRemoteStream(event.streams[0]);
        };

        if (localStream) {
            localStream.getTracks().forEach((track) => {
                pc.current!.addTrack(track, localStream);
            });
        }
    }, [localStream, targetUserId, socket]);

    useEffect(() => {
        if (!socket) return;

        socket.on('incoming-call', (data) => {
            setIncomingCall(data);
            setTargetUserId(data.from);
        });

        socket.on('call-accepted', async (data) => {
            if (pc.current) {
                await pc.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                setCallAccepted(true);
            }
        });

        socket.on('ice-candidate', async (data) => {
            if (pc.current && data.candidate) {
                try {
                    await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                } catch (e) {
                    console.error('Error adding received ice candidate', e);
                }
            }
        });

        socket.on('call-ended', () => {
            cleanup();
        });

        return () => {
            socket.off('incoming-call');
            socket.off('call-accepted');
            socket.off('ice-candidate');
            socket.off('call-ended');
        };
    }, [socket, cleanup]);

    useEffect(() => {
        if (localVideoRef.current && localStream) {
            localVideoRef.current.srcObject = localStream;
        }
    }, [localStream]);

    useEffect(() => {
        if (remoteVideoRef.current && remoteStream) {
            remoteVideoRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    const startCall = async (toUserId: string, name: string) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setTargetUserId(toUserId);
            setIsCalling(true);

            pc.current = new RTCPeerConnection(configuration);
            stream.getTracks().forEach(track => pc.current!.addTrack(track, stream));

            pc.current.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice-candidate', { to: toUserId, candidate: event.candidate });
                }
            };

            pc.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);

            socket?.emit('call-user', {
                to: toUserId,
                offer,
                from: currentUserId,
                name: userName
            });

        } catch (err) {
            console.error('Failed to get local stream', err);
        }
    };

    const answerCall = async () => {
        if (!incomingCall) return;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setLocalStream(stream);
            setCallAccepted(true);

            pc.current = new RTCPeerConnection(configuration);
            stream.getTracks().forEach(track => pc.current!.addTrack(track, stream));

            pc.current.onicecandidate = (event) => {
                if (event.candidate && socket) {
                    socket.emit('ice-candidate', { to: incomingCall.from, candidate: event.candidate });
                }
            };

            pc.current.ontrack = (event) => {
                setRemoteStream(event.streams[0]);
            };

            await pc.current.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
            const answer = await pc.current.createAnswer();
            await pc.current.setLocalDescription(answer);

            socket?.emit('make-answer', {
                to: incomingCall.from,
                answer
            });

            setIncomingCall(null);
        } catch (err) {
            console.error('Failed to answer call', err);
        }
    };

    const declineCall = () => {
        if (incomingCall && socket) {
            socket.emit('hangup', { to: incomingCall.from });
        }
        setIncomingCall(null);
    };

    const hangup = () => {
        if (targetUserId && socket) {
            socket.emit('hangup', { to: targetUserId });
        }
        cleanup();
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    const toggleVideo = () => {
        if (localStream) {
            localStream.getVideoTracks()[0].enabled = isVideoOff;
            setIsVideoOff(!isVideoOff);
        }
    };

    // Expose startCall to window for ChatWindow to use
    useEffect(() => {
        (window as any).startVideoCall = startCall;
        return () => {
            delete (window as any).startVideoCall;
        };
    }, [currentUserId, userName, socket]);

    return (
        <>
            {/* Incoming Call Modal */}
            <Modal
                title="Incoming Call"
                open={!!incomingCall}
                onCancel={declineCall}
                footer={[
                    <Button key="decline" danger onClick={declineCall} icon={<CloseOutlined />}>
                        Decline
                    </Button>,
                    <Button key="answer" type="primary" onClick={answerCall} icon={<VideoCameraOutlined />} className="bg-green-500 hover:bg-green-600">
                        Answer
                    </Button>,
                ]}
                centered
            >
                <div className="flex flex-col items-center gap-4 py-4">
                    <Avatar size={80} icon={<UserOutlined />} className="bg-blue-500" />
                    <Title level={4}>{incomingCall?.name} is calling you...</Title>
                </div>
            </Modal>

            {/* In-Call Interface */}
            <Modal
                open={isCalling || callAccepted}
                footer={null}
                closable={false}
                width={800}
                centered
                styles={{ body: { padding: 0, backgroundColor: '#1a1a1a', borderRadius: '8px', overflow: 'hidden' } }}
            >
                <div className="relative h-[500px] w-full bg-black">
                    {/* Remote Video */}
                    <video
                        ref={remoteVideoRef}
                        autoPlay
                        playsInline
                        className="h-full w-full object-cover"
                    />

                    {!callAccepted && (
                        <div className="absolute inset-0 flex flex-center flex-col items-center justify-center bg-black/60 text-white">
                            <Avatar size={100} icon={<UserOutlined />} className="mb-4 bg-gray-500" />
                            <Title level={3} style={{ color: 'white' }}>Calling...</Title>
                        </div>
                    )}

                    {/* Local Video Overlay */}
                    <div className="absolute top-4 right-4 w-48 h-32 border-2 border-white rounded-lg overflow-hidden bg-gray-800 shadow-xl">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            playsInline
                            muted
                            className="h-full w-full object-cover mirror-mode"
                        />
                    </div>

                    {/* Controls Footer */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-6">
                        <Button
                            shape="circle"
                            size="large"
                            icon={isMuted ? <AudioMutedOutlined /> : <AudioOutlined />}
                            onClick={toggleMute}
                            className={`${isMuted ? 'bg-red-500' : 'bg-gray-700'} border-none text-white hover:opacity-80`}
                        />
                        <Button
                            shape="circle"
                            size="large"
                            danger
                            icon={<PhoneOutlined rotate={225} />}
                            onClick={hangup}
                            className="bg-red-500 border-none scale-125"
                        />
                        <Button
                            shape="circle"
                            size="large"
                            icon={<VideoCameraOutlined />}
                            onClick={toggleVideo}
                            className={`${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} border-none text-white hover:opacity-80`}
                        />
                    </div>
                </div>
            </Modal>

            <style jsx>{`
                .mirror-mode {
                    transform: scaleX(-1);
                }
            `}</style>
        </>
    );
};
