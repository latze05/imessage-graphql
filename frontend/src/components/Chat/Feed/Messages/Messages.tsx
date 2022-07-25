import { useQuery } from "@apollo/client";
import { Flex, Stack } from "@chakra-ui/react";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import MessageOperations from "../../../../graphql/operations/messages";
import {
  MessagesData,
  MessagesSubscriptionData,
  MessagesVariables,
} from "../../../../util/types";
import ListLoader from "../../../common/ListLoader";
import MessageItem from "./MessageItem";

interface MessagesProps {
  userId: string;
  conversationId: string;
}

const Messages: React.FC<MessagesProps> = ({ userId, conversationId }) => {
  const { data, loading, error, subscribeToMore } = useQuery<
    MessagesData,
    MessagesVariables
  >(MessageOperations.Query.messages, {
    variables: {
      conversationId,
    },
  });

  const subscribeToMoreMessages = () => {
    subscribeToMore({
      document: MessageOperations.Subscriptions.messageSent,
      variables: {
        conversationId,
      },
      updateQuery: (prev, { subscriptionData }: MessagesSubscriptionData) => {
        if (!subscriptionData.data) return prev;

        const newMessage = subscriptionData.data.messageSent;

        // return prev;
        return Object.assign({}, prev, {
          messages:
            newMessage.sender.id === userId
              ? prev.messages
              : [newMessage, ...prev.messages],
        });
      },
    });
  };

  useEffect(() => {
    subscribeToMoreMessages();
  }, []);

  if (error) {
    toast.error("Error fetching messages");
    return null;
  }

  return (
    <Flex direction="column" justify="flex-end" overflow="hidden">
      {loading && (
        <Stack spacing={4} px={4}>
          <ListLoader count={4} height="60px" width="100%" />
        </Stack>
      )}
      {data?.messages && (
        <Flex direction="column-reverse" overflow="scroll" height="100%">
          {data.messages.map((message) => (
            <MessageItem key={message.id} message={message} />
          ))}
        </Flex>
      )}
    </Flex>
  );
};
export default Messages;