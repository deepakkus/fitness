"use client";
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, FormControl, FormLabel, Textarea, useToast, Spinner, Checkbox, Stack } from '@chakra-ui/react';
import { useSession } from 'next-auth/react';

const PreferencesPage = () => {
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [getPost, setGetPost] = useState(false);
  const [getEvents, setGetEvents] = useState(false);
  const toast = useToast();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchPreferences = async () => {
      setFetching(true);
      try {
        const res = await fetch('/api/preferences');
        const data = await res.json();
        if (data.pref) {
          setKeywords(data.pref.pref_keyword || '');
          setLocation(data.pref.pref_location || '');
          setDate(data.pref.pref_data ? data.pref.pref_data.substring(0, 10) : '');
          setGetPost(!!data.pref.get_post);
          setGetEvents(!!data.pref.get_events);
        }
      } catch (err) {
        // Optionally show error
      } finally {
        setFetching(false);
      }
    };
    if (status === 'authenticated') {
      fetchPreferences();
    } else {
      setFetching(false);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== 'authenticated') {
      toast({ title: 'You must be logged in to save preferences.', status: 'error' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keywords,
          location,
          date: date || null,
          get_post: getPost ? 1 : 0,
          get_events: getEvents ? 1 : 0,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: 'Preferences saved!', status: 'success' });
      } else {
        toast({ title: data.error || 'Failed to save preferences.', status: 'error' });
      }
    } catch (err) {
      toast({ title: 'Network error.', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md" textAlign="center">
        <Spinner size="lg" />
      </Box>
    );
  }

  return (
    <Box maxW="500px" mx="auto" mt={10} p={6} bg="white" borderRadius="md" boxShadow="md">
      <Heading size="lg" mb={4}>Notification Preferences</Heading>
      <Text mb={6} color="gray.600">
        Subscription service to subscribe to any event or posts containing certain keywords, location, or calendar date.<br/>
        <b>This is not a paid subscription.</b> You will get informed on new posts based on keywords, location, or date—just like the search.
      </Text>
      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Keywords (comma-separated)</FormLabel>
          <Textarea
            placeholder="e.g. yoga, marathon, cycling"
            value={keywords}
            onChange={e => setKeywords(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Location (city or zip)</FormLabel>
          <Input
            placeholder="e.g. New York or 10001"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Date (optional)</FormLabel>
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </FormControl>
        <FormControl mb={4}>
          <FormLabel>Notification Types</FormLabel>
          <Stack direction="row" spacing={6}>
            <Checkbox isChecked={getEvents} onChange={e => setGetEvents(e.target.checked)}>Event</Checkbox>
            <Checkbox isChecked={getPost} onChange={e => setGetPost(e.target.checked)}>Post</Checkbox>
          </Stack>
        </FormControl>
        <Button colorScheme="orange" type="submit" w="full" isLoading={loading} disabled={loading}>
          Save Preferences
        </Button>
      </form>
    </Box>
  );
};

export default PreferencesPage; 