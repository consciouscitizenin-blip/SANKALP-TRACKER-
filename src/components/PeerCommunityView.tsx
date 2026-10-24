import React, { useState, useEffect } from 'react';
import { Trophy, Users, MessageSquare, ThumbsUp, Send, Cloud } from 'lucide-react';
import { User } from 'firebase/auth';
import {
  db,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  createStudyGroupPost,
  upvoteStudyGroupPost,
  handleFirestoreError,
  OperationType,
} from '../services/firebase';

interface PeerLeaderboardRow {
  id: string;
  displayName: string;
  xpPoints: number;
  streakDays: number;
  weeklyHours: number;
  syllabusPercent: number;
  targetTier: string;
}

interface DiscussionPost {
  id: string;
  authorName: string;
  groupTag: string;
  title: string;
  body: string;
  upvotes: number;
}

interface PeerCommunityViewProps {
  currentUser: User | null;
  userXp: number;
  userStreak: number;
  userWeeklyHours: number;
  userSyllabusPct: number;
  onRequestSignIn: () => void;
}

const CURATED_PEER_BENCHMARKS: PeerLeaderboardRow[] = [
  {
    id: 'peer-1',
    displayName: 'Aarav Sharma (AIR-42 Target)',
    xpPoints: 3420,
    streakDays: 24,
    weeklyHours: 41.5,
    syllabusPercent: 78,
    targetTier: 'Inspector (Income Tax)',
  },
  {
    id: 'peer-2',
    displayName: 'Priya Nair (Tier-II Focus)',
    xpPoints: 3110,
    streakDays: 19,
    weeklyHours: 38.0,
    syllabusPercent: 71,
    targetTier: 'ASO (MEA)',
  },
  {
    id: 'peer-3',
    displayName: 'Rohan Verma (Quant Specialist)',
    xpPoints: 2690,
    streakDays: 14,
    weeklyHours: 35.5,
    syllabusPercent: 64,
    targetTier: 'ASO (CSS)',
  },
  {
    id: 'peer-4',
    displayName: 'Ananya Gupta (GK & Polity)',
    xpPoints: 2180,
    streakDays: 9,
    weeklyHours: 31.0,
    syllabusPercent: 52,
    targetTier: 'Auditor (CAG)',
  },
];

const INITIAL_FORUM_POSTS: DiscussionPost[] = [
  {
    id: 'seed-post-1',
    authorName: 'Aarav Sharma',
    groupTag: 'Quant & Geometry',
    title: 'Fastest way to solve Radical Axis & Common Chord questions in Tier-II?',
    body: 'When two circles intersect orthogonally, length of common chord is (2 * r1 * r2) / sqrt(r1^2 + r2^2). Saves at least 40 seconds compared to cosine law!',
    upvotes: 18,
  },
  {
    id: 'seed-post-2',
    authorName: 'Priya Nair',
    groupTag: 'General Awareness',
    title: 'Important Constitutional Amendments asked in last 3 SSC CGL shifts',
    body: 'Focus heavily on 42nd, 44th, 52nd (Anti-Defection), 61st (Voting Age), 86th (Right to Education), and 101st (GST) Amendments.',
    upvotes: 24,
  },
];

export const PeerCommunityView: React.FC<PeerCommunityViewProps> = ({
  currentUser,
  userXp,
  userStreak,
  userWeeklyHours,
  userSyllabusPct,
  onRequestSignIn,
}) => {
  const [cloudLeaders, setCloudLeaders] = useState<PeerLeaderboardRow[]>([]);
  const [posts, setPosts] = useState<DiscussionPost[]>(INITIAL_FORUM_POSTS);
  const [selectedGroup, setSelectedGroup] = useState<string>('All Groups');

  // New Forum Post form
  const [postGroup, setPostGroup] = useState('Quant & Geometry');
  const [postTitle, setPostTitle] = useState('');
  const [postBody, setPostBody] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const lbQuery = query(collection(db, 'leaderboard'), orderBy('xpPoints', 'desc'), limit(15));
    const unsubLb = onSnapshot(
      lbQuery,
      (snap) => {
        const rows: PeerLeaderboardRow[] = [];
        snap.forEach((d) => {
          const data = d.data();
          rows.push({
            id: d.id,
            displayName: data.displayName || 'Aspirant',
            xpPoints: Number(data.xpPoints) || 0,
            streakDays: Number(data.streakDays) || 0,
            weeklyHours: Number(data.weeklyHours) || 0,
            syllabusPercent: Number(data.syllabusPercent) || 0,
            targetTier: data.targetTier || 'SSC CGL Aspirant',
          });
        });
        setCloudLeaders(rows);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'leaderboard');
      }
    );

    const forumQuery = query(collection(db, 'forum_posts'), orderBy('upvotes', 'desc'), limit(20));
    const unsubForum = onSnapshot(
      forumQuery,
      (snap) => {
        const loaded: DiscussionPost[] = [];
        snap.forEach((d) => {
          const data = d.data();
          loaded.push({
            id: d.id,
            authorName: data.authorName || 'Aspirant',
            groupTag: data.groupTag || 'General',
            title: data.title || '',
            body: data.body || '',
            upvotes: Number(data.upvotes) || 0,
          });
        });
        if (loaded.length > 0) {
          setPosts([...loaded, ...INITIAL_FORUM_POSTS]);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'forum_posts');
      }
    );

    return () => {
      unsubLb();
      unsubForum();
    };
  }, [currentUser]);

  // Combine user's live row with peer benchmarks
  const myRow: PeerLeaderboardRow = {
    id: currentUser?.uid || 'local-user',
    displayName: `${currentUser?.displayName || 'You (Current Session)'}`,
    xpPoints: userXp,
    streakDays: userStreak,
    weeklyHours: userWeeklyHours,
    syllabusPercent: userSyllabusPct,
    targetTier: 'ASO (MEA / Income Tax)',
  };

  const mergedLeaderboard = [
    myRow,
    ...cloudLeaders.filter((r) => r.id !== myRow.id),
    ...CURATED_PEER_BENCHMARKS,
  ].sort((a, b) => b.xpPoints - a.xpPoints);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postBody.trim()) return;

    if (currentUser) {
      setPosting(true);
      try {
        await createStudyGroupPost({
          user: currentUser,
          groupTag: postGroup,
          title: postTitle,
          body: postBody,
        });
        setPostTitle('');
        setPostBody('');
      } finally {
        setPosting(false);
      }
    } else {
      // Local instant append when in offline/guest mode
      const localPost: DiscussionPost = {
        id: `local-${Date.now()}`,
        authorName: 'You (Aspirant)',
        groupTag: postGroup,
        title: postTitle.trim(),
        body: postBody.trim(),
        upvotes: 1,
      };
      setPosts((prev) => [localPost, ...prev]);
      setPostTitle('');
      setPostBody('');
    }
  };

  const handleUpvote = async (post: DiscussionPost) => {
    if (currentUser && !post.id.startsWith('seed-') && !post.id.startsWith('local-')) {
      await upvoteStudyGroupPost(post.id, post.upvotes);
    } else {
      setPosts((prev) =>
        prev.map((p) => (p.id === post.id ? { ...p, upvotes: p.upvotes + 1 } : p))
      );
    }
  };

  const visiblePosts =
    selectedGroup === 'All Groups'
      ? posts
      : posts.filter((p) => p.groupTag === selectedGroup);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Peer Comparison Leaderboard */}
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  01. All-India SSC CGL Peer Leaderboard
                </h2>
                <p className="text-xs text-slate-400">
                  Compare weekly study hours, syllabus completion, and XP streaks against peers
                </p>
              </div>
            </div>
            {!currentUser && (
              <button
                type="button"
                onClick={onRequestSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 whitespace-nowrap shrink-0"
              >
                <Cloud className="w-3.5 h-3.5" />
                <span>Sync Live Rank</span>
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-xs text-slate-400">
                  <th className="py-2.5 px-3 font-medium">Rank</th>
                  <th className="py-2.5 px-3 font-medium">Aspirant</th>
                  <th className="py-2.5 px-3 font-medium text-right">Weekly Hrs</th>
                  <th className="py-2.5 px-3 font-medium text-right">Syllabus</th>
                  <th className="py-2.5 px-3 font-medium text-right">XP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {mergedLeaderboard.map((row, idx) => {
                  const isMe = row.id === myRow.id;
                  return (
                    <tr
                      key={row.id}
                      className={isMe ? 'bg-amber-500/10' : 'hover:bg-slate-800/40'}
                    >
                      <td className="py-3 px-3 font-mono tabular-nums font-bold text-slate-300">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-semibold text-white">{row.displayName}</div>
                        <div className="text-slate-500">
                          {row.targetTier} · {row.streakDays}d streak
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-200">
                        {row.weeklyHours.toFixed(1)}h
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-400">
                        {row.syllabusPercent}%
                      </td>
                      <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold text-amber-400">
                        {row.xpPoints.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: Study Groups & Doubt Resolution Forum */}
        <section className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-amber-400" />
              <div>
                <h2 className="text-lg font-semibold text-white">
                  02. SSC CGL Study Groups & Discussion Forum
                </h2>
                <p className="text-xs text-slate-400">
                  Collaborate with peers on Tier-II Quant shortcuts, English rules, and GK notes
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
              {['All Groups', 'Quant & Geometry', 'General Awareness', 'English & Vocab'].map(
                (grp) => (
                  <button
                    key={grp}
                    type="button"
                    onClick={() => setSelectedGroup(grp)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      selectedGroup === grp
                        ? 'bg-amber-500 text-slate-950 font-semibold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {grp}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Post a Doubt / Strategy Note */}
          <form onSubmit={handleCreatePost} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Discussion Title or Doubt Question..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                className="sm:col-span-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <select
                aria-label="Study Group Category"
                value={postGroup}
                onChange={(e) => setPostGroup(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white"
              >
                <option value="Quant & Geometry">Quant & Geometry</option>
                <option value="General Awareness">General Awareness</option>
                <option value="English & Vocab">English & Vocab</option>
              </select>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Share shortcut formula, PYQ explanation, or study group note..."
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white"
              />
              <button
                type="submit"
                disabled={posting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post to Group</span>
              </button>
            </div>
          </form>

          {/* Forum Posts Feed */}
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {visiblePosts.map((post) => (
              <div
                key={post.id}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-semibold text-white">{post.title}</h3>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {post.authorName} · {post.groupTag}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleUpvote(post)}
                    className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 rounded-lg border border-slate-800 text-xs font-mono tabular-nums shrink-0"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{post.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};
