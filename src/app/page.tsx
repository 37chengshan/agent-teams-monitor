'use client'

import { MotionContainer, MotionList, MotionListItem } from '@/components/animations'
import { PageContainer } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useTeams, useTasks, useInbox } from '@/lib/hooks'
import { Activity, CheckCircle2, MessageSquare, Users, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { teams } = useTeams()
  const { tasks } = useTasks()
  const { messages } = useInbox()

  // 计算统计数据
  const activeTeams = teams.length
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length
  const unreadMessages = messages.filter(m => !m.read).length
  const completedTasks = tasks.filter(t => t.status === 'completed').length

  // 最近团队（前5个）
  const recentTeams = teams.slice(0, 5)

  // 最近消息（最新5条）
  const recentMessages = messages.slice(0, 5)

  return (
    <PageContainer>
      <MotionContainer animation="fade">
        <div className="space-y-8">
          {/* 页面标题 */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">
              仪表板
            </h1>
            <p className="text-muted-foreground">
              实时监控 AI 代理团队的活动和状态
            </p>
          </div>

          {/* 统计卡片 */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <MotionContainer animation="scale" delay={0.1}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    活跃团队
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeTeams}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    当前活跃的团队数量
                  </p>
                </CardContent>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5" />
              </Card>
            </MotionContainer>

            <MotionContainer animation="scale" delay={0.2}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    进行中任务
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{inProgressTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    正在执行的任务
                  </p>
                </CardContent>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/5" />
              </Card>
            </MotionContainer>

            <MotionContainer animation="scale" delay={0.3}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    未读消息
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{unreadMessages}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    等待处理的消息
                  </p>
                </CardContent>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-orange-500/5" />
              </Card>
            </MotionContainer>

            <MotionContainer animation="scale" delay={0.4}>
              <Card className="relative overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    已完成任务
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{completedTasks}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    完成的任务总数
                  </p>
                </CardContent>
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/5" />
              </Card>
            </MotionContainer>
          </div>

          {/* 最近活动 */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* 最近团队 */}
            <MotionContainer animation="fade" delay={0.5}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>最近团队</CardTitle>
                      <CardDescription>当前活跃的团队列表</CardDescription>
                    </div>
                    <Link href="/teams">
                      <Button variant="ghost" size="sm">
                        查看全部
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTeams.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无团队数据
                    </div>
                  ) : (
                    <MotionList staggerDelay={0.05}>
                      {recentTeams.map((team) => (
                        <MotionListItem key={team.id}>
                          <div className="flex items-center justify-between py-3 border-b last:border-0">
                            <div className="space-y-1">
                              <div className="font-medium">{team.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {team.description}
                              </div>
                            </div>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {team.members.length}
                            </Badge>
                          </div>
                        </MotionListItem>
                      ))}
                    </MotionList>
                  )}
                </CardContent>
              </Card>
            </MotionContainer>

            {/* 最近消息 */}
            <MotionContainer animation="fade" delay={0.6}>
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>最近消息</CardTitle>
                      <CardDescription>最新的团队通信</CardDescription>
                    </div>
                    <Link href="/inbox">
                      <Button variant="ghost" size="sm">
                        查看全部
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      暂无消息数据
                    </div>
                  ) : (
                    <MotionList staggerDelay={0.05}>
                      {recentMessages.map((message) => (
                        <MotionListItem key={message.id}>
                          <div className="flex items-start gap-3 py-3 border-b last:border-0">
                            <div className={`h-2 w-2 rounded-full mt-2 ${
                              message.read ? 'bg-muted' : 'bg-primary'
                            }`} />
                            <div className="flex-1 space-y-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="font-medium truncate">
                                  {message.from}
                                </div>
                                <div className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </div>
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2">
                                {message.summary || message.text?.slice(0, 100)}
                              </div>
                            </div>
                          </div>
                        </MotionListItem>
                      ))}
                    </MotionList>
                  )}
                </CardContent>
              </Card>
            </MotionContainer>
          </div>
        </div>
      </MotionContainer>
    </PageContainer>
  )
}
