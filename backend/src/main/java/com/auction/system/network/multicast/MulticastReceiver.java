package com.auction.system.network.multicast;

import java.net.DatagramPacket;
import java.net.InetAddress;
import java.net.MulticastSocket;
import java.net.NetworkInterface;

/**
 * UDP Multicast Receiver Client (Member 3 Testing)
 *
 * Subscribes to multicast group and receives auction updates
 * Run this as a standalone client to see real-time broadcasts
 */
public class MulticastReceiver {

    private static final String MULTICAST_GROUP = "230.0.0.1";
    private static final int PORT = 4446;

    public static void main(String[] args) {
        System.out.println("╔═══════════════════════════════════════════════════════════╗");
        System.out.println("║     UDP MULTICAST RECEIVER (Member 3 Testing)            ║");
        System.out.println("╚═══════════════════════════════════════════════════════════╝");
        System.out.println();
        System.out.println("Joining multicast group: " + MULTICAST_GROUP + ":" + PORT);
        System.out.println("Waiting for auction updates...");
        System.out.println("(Press Ctrl+C to exit)");
        System.out.println();

        try {
            // Create multicast socket
            MulticastSocket socket = new MulticastSocket(PORT);
            InetAddress group = InetAddress.getByName(MULTICAST_GROUP);

            // Join the multicast group
            NetworkInterface netInterface = NetworkInterface.getByInetAddress(InetAddress.getLocalHost());
            socket.joinGroup(new java.net.InetSocketAddress(group, PORT), netInterface);

            System.out.println("✅ Successfully joined multicast group!");
            System.out.println("📡 Listening for broadcasts...\n");

            byte[] buffer = new byte[1024];

            while (true) {
                // Receive multicast message
                DatagramPacket packet = new DatagramPacket(buffer, buffer.length);
                socket.receive(packet);

                // Convert to string
                String message = new String(packet.getData(), 0, packet.getLength());

                // Display received message
                System.out.println("┌─────────────────────────────────────────────────────────┐");
                System.out.println("│ 📨 MULTICAST MESSAGE RECEIVED                           │");
                System.out.println("├─────────────────────────────────────────────────────────┤");
                System.out.println("│ From: " + packet.getAddress().getHostAddress() + ":" + packet.getPort());
                System.out.println("│ Time: " + java.time.LocalDateTime.now());
                System.out.println("├─────────────────────────────────────────────────────────┤");
                System.out.println("│ Data:                                                   │");
                System.out.println("│ " + message);
                System.out.println("└─────────────────────────────────────────────────────────┘");
                System.out.println();
            }

        } catch (Exception e) {
            System.err.println("❌ Error: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
